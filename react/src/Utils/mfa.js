import {
    Manga, Chapter, Author, Cover, Group, User
} from 'mangadex-full-api';

import { isOnline, standardize } from './index';
import { DexDM } from "./StorageManager";
import { DexCache } from "./StorageManager/DexCache";

export async function resolveChapter(chapter, resolutionItems) {
    const reqs = {
        manga: false,
        groups: false,
        uploader: false,
        pages: false,
        pageUrls: false,
    };
    if (typeof chapter === 'string') {
        chapter = await Chapter.get(chapter);
    } else if (!isMfaObject(chapter, reqs)) {
        chapter = await Chapter.get(chapter.id);
    }
    const _ch = chapter;
    const res = await resolveEntity(_ch, resolutionItems, reqs);
    return standardize(res);
}

export async function resolveManga(manga, resolutionItems) {
    if(!isOnline()) {
        const id = typeof manga === 'string' ? manga: manga.id;
        const mg = await DexDM.getDownloadedManga(id);
        return mg;
    }
    
    const reqs = {
        mainCover: false,
        statistics: false,
        authors: false,
        artists: false,
        aggregate: false,
        covers: false,
        readChapterIds: false,
        readingStatus: false,
    };
    if (typeof manga === 'string') {
        manga = await Manga.get(manga);
    } else if (!isMfaObject(manga, reqs)) {
        manga = await Manga.get(manga.id);
    }
    const _manga = manga;
    const res = await resolveEntity(_manga, resolutionItems, reqs);
    if (shouldResolve('aggregate', resolutionItems, reqs)) {
        let ct = 0, aCt = 0;
        for (let volName of Object.keys(res.aggregate)) {
            const vol = res.aggregate[volName];
            aCt += vol.count;
            ct += Object.keys(vol.chapters).length;
        }
        res.chapterCount = ct;
        res.actualChapterCount = aCt;
        res.volumeCount = Object.keys(res.aggregate).length;
    }

    if (shouldResolve('statistics', resolutionItems, reqs)) {
        res.follows = res.statistics?.follows;
        res.rating = res.statistics?.rating.average;        
    }

    if (shouldResolve('readChapterIds', resolutionItems, reqs)) {
        res.readChapterCount = Object.keys(res.readChapterIds || {}).length;
    }


    return standardize(res);
}

function isMfaObject(entity, reqs) {
    for (let key of Object.keys(reqs)) {
        if (!reqs[key]) continue;
        if (!entity[key] || typeof entity[key].resolve !== 'function') return false;
    }
    return true;
}

async function resolveEntity(entity, resolutionItems, reqs) {
    const promises = [];
    const srcKeys = Object.keys(reqs);
    srcKeys.forEach(key => {
        if (shouldResolve(key, resolutionItems, reqs)) {
            const item = entity[key];

            if (Array.isArray(item)) {
                promises.push(Promise.allSettled(item.map(i => resolveItem(i, { entity, key }))));
            } else {
                promises.push(resolveItem(item, { entity, key }));
            }
            entity[key] = promises.length - 1;
        }
    });
    const resolved = await Promise.allSettled(promises);
    srcKeys.forEach(key => {
        if (shouldResolve(key, resolutionItems, reqs)) {
            const res = resolved[entity[key]];
            if (res.status === 'rejected') {
                return entity[key] = null;
            }
            
            var itemVal = res.value;
            if (Array.isArray(itemVal)) {
                entity[key] = itemVal.map(i => {
                    if(i?.status) {
                        if (i.status === 'rejected') {
                            return null;
                        }
                        return i.value;
                    } else {
                        return i;
                    }
                });
            } else {
                entity[key] = itemVal;
            }
        }
    });

    return entity;


    function resolveItem(item, { entity, key }) {
        switch (key) {
            case 'aggregate':
                return Manga.getAggregate(entity.id);
            case 'statistics':
                return Manga.getStatistics(entity.id);
            case 'covers':
                return Manga.getCovers(entity.id);
            case 'readChapterIds': {
                return new Promise(async (resolve, reject) => {
                    try {
                        const readCache = new DexCache();
                        readCache.name = 'manga-readership';
                        let readership = await readCache.fetch();
                        if (!readership || readCache.getMeta('mangaId') !== entity.id) {
                            readership = await Manga.getReadChapterIds(entity.id);
                            readership = readership.reduce((agg, chId) => {
                                agg[chId] = true
                                return agg;
                            }, {});
                            readCache.data = readership;
                            readCache.setMeta('mangaId', entity.id);
                            readCache.save();
                        }
                        resolve(readership);
                    } catch (err) {
                        reject(err);
                    }
                });
            }
            case 'readingStatus':
                return Manga.getReadingStatus(entity.id);

            case 'pageUrls':
                return Chapter.getReadablePages(entity.id);
        }


        if (!item) {
            return Promise.resolve(item);
        } else if (!item.id) {
            throw new Error('Cannot resolve property without id');
        } else if (!item.type) {
            return Promise.resolve(item);
        } else {
            switch (item.type) {
                case 'artist':
                    return Author.get(item.id);
                case 'author':
                    return Author.get(item.id);
                case 'cover_art':
                    return Cover.get(item.id);
                case 'scanlation_group':
                    return Group.get(item.id);
                case 'manga':
                    return Manga.get(item.id);
                case 'user':
                    return User.get(item.id);
            }
        }
    }
}

function shouldResolve(key, resolutionItems, reqs) {
    if(resolutionItems === true) return true;
    
    const defaultRes = reqs[key];
    if(defaultRes === undefined) return false;
    return typeof resolutionItems === 'object' && resolutionItems[key] !== undefined ?
        resolutionItems[key] : defaultRes;
}