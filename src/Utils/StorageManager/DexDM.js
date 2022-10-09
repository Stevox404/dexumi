import Dexie from "dexie";
import { Chapter, Manga } from 'mangadex-full-api';
import store from "Redux/store";
import { Deferred, fetchBlobUrl, hashCode } from "Utils";
import { resolveChapter, resolveManga } from "Utils/mfa";


const db = new Dexie("_dld");
db.version(1).stores({
    _dld_manga: 'id,sig',
    _dld_chapter: 'id,mangaId,chapter,publishAt,updatedAt,sig',
    _dld_page: 'url,chapterId,sig',
});

// TODO on delete put in trash, delete trash on refresh (or cfg time)

db._dld_chapter.toArray().then(v => {
    _downloadedList.push(...v);
});

const _downloadQueue = [];
let _downloadedList = [];
function getDowloadedList() {
    if(!_downloadedList._sigFiltered) {
        const sig = getSig();
        if(sig) {
            _downloadedList = _downloadedList.filter(v => v.sig == sig);
            _downloadedList._sigFiltered = true;
            return _downloadedList;
        } else {
            return [];
        }
    }
    return _downloadedList;
}

let _downloading = false;
/**@type {ChapterDM} */
let _current = null;

let _sig = null;
function getSig() {
    if (_sig) return _sig;

    const { user } = store.getState();
    if (!user) {
        console.warn('Download Manager expected user to be logged in');
        return '';
    }
    const code = hashCode(user.username);
    _sig = code;
    return code;
}


const handler = {
    get(target, key) {
        const val = target[key];
        if (typeof val === 'object') {
            return new Proxy(val, handler);
        } else return val;
    }
}


export class DexDM {
    static async getDownloadedManga(id) {
        const sig = getSig();
        if(!sig) return [];
        if (id) {
            return db._dld_manga.get(id);
        }
        return db._dld_manga.toArray();
    }

    static async getDownloadedChapters(mangaId, params = {}) {
        const {offset, limit, order} = params;
        const sig = getSig();
        if(!sig) return [];
        
        let qry = db._dld_chapter
            .where('mangaId').equals(mangaId)
            .and('sig').equals(sig);
        
        if(offset) {
            qry = qry.offset(offset);
        }

        if(limit) {
            qry = qry.limit(limit);
        }

        if(order) {
            const col = Object.keys(order)[0];
            const dir = Object.values(order)[0];
            if(dir == 'desc') {
                qry = qry.reverse()
            }
            qry = qry.sortBy(col);
        } else {
            qry = qry.toArray();
        }

        return qry;
    }
}

export class ChapterDM extends EventTarget {
    /**
     * @param {Chapter} chapter 
     */
    constructor(chapter) {
        super();
        this.id = chapter.id;
        this.chapter = chapter;
    }

    #index = null;

    get index() {
        return this.#index;
    }

    /**
     * @return {number} Index in the downloadQueue
     */
    addToQueue() {
        const idx = _downloadQueue.push(this);
        this.#index = idx;
        ChapterDM.beginDownload();
        return this.#index;
    }

    /**
     * @return {number} New size of download queue
     */
    removeFromQueue() {
        if (this.#index == null) throw new Error('Not in queue');
        _downloadQueue.splice(this.#index, 1);
        return _downloadQueue.length;
    }

    /**
     * Deletes chapter from queue (as well as any progress if currently downloading)
     */
    cancel() {
        if (this.#index == null) throw new Error('Not in queue');
    }

    /**
     * Moves the chapter higher in the download queue (lower index)
     */
    moveUp() {
        if (this.#index == null) throw new Error('Not in queue');

        const idx = this.#index;
        if (idx === 0) return 0;
        const cDl = _downloadQueue.splice(idx, 1);
        _downloadQueue.splice(idx - 1, 0, cDl);
        return idx - 1;
    }

    /**
     * Moves the chapter lower in the download queue (higher index)
     */
    moveDown() {
        if (this.#index == null) throw new Error('Not in queue');

        const idx = this.#index;
        if (idx === _downloadQueue.length - 1) return _downloadQueue.length - 1;
        const cDl = _downloadQueue.splice(idx, 1);
        _downloadQueue.splice(idx + 1, 0, cDl);
        return idx + 1;
    }

    /**
     * Moves the chapter to the top of the download queue (will be downloaded first)
     */
    moveToTop() {
        if (this.#index == null) throw new Error('Not in queue');

        const idx = this.#index;
        if (idx === 0) return 0;
        const cDl = _downloadQueue.splice(idx, 1);
        _downloadQueue.splice(0, 0, cDl);
        return 0;
    }

    /**
     * Moves the chapter to the bottom of the download queue (will be downloaded last)
     */
    moveToTop() {
        if (this.#index == null) throw new Error('Not in queue');

        const idx = this.#index;
        const last = _downloadQueue.length - 1;
        if (idx === last) return last;
        const cDl = _downloadQueue.splice(idx, 1);
        _downloadQueue.splice(last, 0, cDl);
        return last;
    }

    getChapterDownloadState() {
        return ChapterDM.getChapterDownloadState(this.chapter.id);
    }

    async cancel() {
        await ChapterDM.cancelDownload(this.chapter.id);
    }

    async delete() {
        await ChapterDM.deleteChapter(this.chapter.id);
    }



    static requestCancelDownload = () => { };

    /**
     * @return {Chapter[]} A read-only array of chapter objects
     */
    static get queue() {
        return new Proxy(_downloadQueue, handler);
    }

    /**
     * To be called at start of application. Fetches download queue from local
     * storage and begins processing. Is idempotent.
     * 
     * @returns {string|null} The id of the chapter being downloaded
     */
    static beginDownload() {
        if (!_downloading) {
            _downloading = true;
            _downloadNextInQueue();
        }
        return _current?.chapter.id;
    }

    /**
     * Pause the download process
     */
    static pause() {
        _downloading = false;
    }

    /**
     * Resumes the download process.
     * Not `beginDownload()`
     */
    static resume() {
        ChapterDM.beginDownload();
    }

    static downloadStates = {
        DOWNLOADED: Symbol('DOWNLOADED'),
        DOWNLOAD_ERR: Symbol('DOWNLOAD_ERR'),
        NOT_DOWNLOADED: Symbol('NOT_DOWNLOADED'),
        PENDING: Symbol('PENDING'),
        DOWNLOADING: Symbol('DOWNLOADING'),
    }

    /**
     * Get the download status of the chapter
     * @param {string} chapterId 
     */
    static getChapterDownloadState(chapterId) {
        if (getDowloadedList().some(ch => ch.id == chapterId)) {
            return ChapterDM.downloadStates.DOWNLOADED;
        } else if (_current?.chapter.id == chapterId) {
            return ChapterDM.downloadStates.DOWNLOADING;
        } else if (_downloadQueue.some(ch => ch.id == chapterId)) {
            return ChapterDM.downloadStates.PENDING;
        } else {
            return ChapterDM.downloadStates.NOT_DOWNLOADED;
        }
    }

    /**
     * Get downloaded manga details
     * @param {string?} id 
     * @returns {Promise<Manga|Manga[]>}
     */
    static getManga(id) {
        const sig = getSig();
        if (id) {
            return db._dld_manga.get({id, sig});
        } else {
            return db._dld_manga.toArray();
        }
    }

    /**
     * Get downloaded manga chapter
     * @param {string} id 
     * @returns {Promise<Chapter>}
     */
    static async getChapter(id) {
        const sig = getSig();
        const chapter = await db._dld_chapter.get({id, sig});
        const manga = await db._dld_manga.get({
            id: chapter.mangaId, sig
        });
        const pages = await db._dld_page.get({
            chapterId: chapter.id
        });
        return ({
            ...chapter,
            manga,
            pages
        });
    }

    static async cancelDownload(id) {
        const idx = _downloadQueue.findIndex(ch => ch.id == id);
        if (idx > -1) {
            _downloadQueue.splice(idx, 1);
            return true;
        } else {
            await ChapterDM.requestCancelDownload();
            return true;
        }
    }

    static async deleteChapter(id) {
        await db._dld_page.where('chapterId').equals(id).delete();
        return db._dld_chapter.delete(id);
    }

}







/* Private */

const DexPage = db._dld_page.defineClass({
    chapter: Object,
    url: String,
    pageNum: Number,
});

DexPage.prototype.download = async function () {
    if (!_downloading) return;

    if (!this.chapter) throw new Error('Save Failed. Record has no chapter.');
    if (!this.url) throw new Error('Save Failed. Record has no url.');

    this.date = new Date();
    this.chapterId = this.chapter.id;
    var chapter = this.chapter;

    // @todo cache this check
    var ch = await db._dld_chapter.get(this.chapterId);
    if (!ch) await _saveChapterDetails(this.chapter);

    const totalPages = chapter.pageUrls.length;

    delete this.chapter;

    // Use fetch instead of img to get the blob, helper func
    try {
        const blob = await fetchBlobUrl(this.url);
        this.imageBlobUrl = blob;
        await db._dld_page.put(this);

        const progressEvent = new CustomEvent('progress', {
            detail: {
                chapter,
                page: this.pageNum,
                total: totalPages,
            }
        });
        _current.dispatchEvent(progressEvent);
    } catch (err) {
        this.error = true;
        await db._dld_page.put(this);

        const progressEvent = new CustomEvent('progress', {
            detail: {
                chapter,
                page: this.pageNum,
                total: totalPages,
                error: err,
                hasError: true,
            }
        });
        _current.dispatchEvent(progressEvent);
    }
}




async function _saveChapterDetails(chapter) {
    const id = chapter.mangaId || chapter.manga?.id;
    if (!id) throw new Error('Chapter has no manga');

    let manga = await db._dld_manga.get(id);
    if (!manga) {
        const _manga = await resolveManga(chapter.manga.id, true);
        manga = _manga;

        // Get the main cover blob
        const blob = await fetchBlobUrl(_manga.mainCover.image512);
        _manga.mainCover.imageBlobUrl = blob;
        
        // Get the cover blobs
        for (const cover of _manga.covers) {
            const blob = await fetchBlobUrl(cover.image512);
            cover.imageBlobUrl = blob;
        }
        _manga.sig = getSig();
        
        await db._dld_manga.put(_manga);
    }
    const _chapter = await resolveChapter(chapter, {
        manga: false,
    });
    _chapter.mangaId = manga.id;
    _chapter.sig = getSig();
    delete chapter.manga;
    await db._dld_chapter.put(_chapter);
}

function _downloadNextInQueue() {
    if (!_downloading) return;

    const cDl = _downloadQueue[0];
    if (cDl) {
        _downloadChapter(cDl);
    } else {
        _downloading = false;
    }
}

/**
 * @param {ChapterDM} cDl 
 */
async function _downloadChapter(cDl) {
    _current = cDl;
    let chapter = await resolveChapter(cDl.chapter, {
        pageUrls: true
    });
    try {
        const startEvent = new CustomEvent('start', {
            detail: {
                chapter
            }
        });
        cDl.dispatchEvent(startEvent);
    
        let isDownloadCancelled = false;
        ChapterDM.requestCancelDownload = () => {
            isDownloadCancelled = new Deferred();
        }
    
        const pages = chapter.pageUrls;
        for (const pg of pages) {
            if (isDownloadCancelled) break;
    
            const page = new DexPage();
            page.chapter = chapter;
            page.url = pg;
            page.sig = getSig();
            await page.download();
        }
    
        if (isDownloadCancelled) {
            await ChapterDM.deleteChapter(chapter.id);
            isDownloadCancelled.resolve();
            ChapterDM.requestCancelDownload = () => { };
        } else {
            const endEvent = new CustomEvent('end', {
                detail: {
                    chapter
                }
            });
            cDl.dispatchEvent(endEvent);
        }
    
    
    
    
        const pCDl = _downloadQueue[0];
        if (pCDl === _current) {
            _downloadQueue.shift();
        } else {
            const idx = _downloadQueue.indexOf(cDl);
            _downloadQueue.splice(idx, 1);
        }
    
        _downloadNextInQueue();
    } catch (err) {
        const endEvent = new CustomEvent('end', {
            detail: {
                chapter,
                error: err,
                hasError: true,
            }
        });
        cDl.dispatchEvent(endEvent);
        _downloadNextInQueue();
    }
}