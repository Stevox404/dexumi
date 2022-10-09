/**
 * @todo Add the get functions for each object as properties e.g. getCovers as covers
 */


import {
    Author, Chapter, Cover, Group, List, Manga, User
} from 'mangadex-full-api';

export function standardize(obj) {
    let std = obj;

    if (!obj._isStandardized) {
        if (obj instanceof Author) {
            std = stdAuthor(obj);
        } else if (obj instanceof Chapter) {
            std = stdChapter(obj);
        } else if (obj instanceof Cover) {
            std = stdCover(obj);
        } else if (obj instanceof Group) {
            std = stdGroup(obj);
        } else if (obj instanceof List) {
            std = stdList(obj);
        } else if (obj instanceof Manga) {
            std = stdManga(obj);
        } else if (obj instanceof User) {
            std = stdUser(obj);
        } else {
            std = clean(obj);
        }
    }

    return std;
}

function clean(obj) {
    const res = {};
    for(let [k,v] of Object.entries(obj)){
        if(v !== undefined) res[k] = v;
    }
    res._isStandardized = true;
    return res;
}


function stdAuthor(obj) {
    if (!obj) return obj;
    return clean({
        id: obj.id,
        biography: obj.biography,
        createdAt: obj.createdAt,
        imageUrl: obj.imageUrl,
        manga: obj.manga?.map(stdManga),
        name: obj.name,
        updatedAt: obj.updatedAt,
    })
}

function stdChapter(obj) {
    if (!obj) return obj;
    return clean({
        id: obj.id,
        chapter: obj.chapter,
        createdAt: obj.createdAt,
        externalUrl: obj.externalUrl,
        groups: obj.groups?.map(stdGroup),
        isExternal: obj.isExternal,
        manga: stdManga(obj.manga),
        pages: obj.pages,
        pageNames: obj.pageNames,
        pageUrls: obj.pageUrls,
        publishAt: obj.publishAt,
        saverPageNames: obj.saverPageNames,
        title: obj.title,
        translatedLanguage: obj.translatedLanguage,
        updatedAt: obj.updatedAt,
        uploader: stdUser(obj.uploader),
        volume: obj.volume,
    })
}

function stdCover(obj) {
    if (!obj) return obj;
    return clean({
        id: obj.id,
        createdAt: obj.createdAt,
        description: obj.description,
        image256: obj.image256,
        image512: obj.image512,
        imageSource: obj.imageSource,
        manga: stdManga(obj.manga),
        updatedAt: obj.updatedAt,
        uploader: stdUser(obj.uploader),
        volume: obj.volume,
    })
}

function stdGroup(obj) {
    if (!obj) return obj;
    return clean({
        id: obj.id,
        contactEmail: obj.contactEmail,
        createdAt: obj.createdAt,
        description: obj.description,
        discord: obj.discord,
        focusedLanguages: obj.focusedLanguages,
        inactive: obj.inactive,
        ircChannel: obj.ircChannel,
        ircServer: obj.ircServer,
        leader: stdUser(obj.leader),
        locked: obj.locked,
        members: obj.members?.map(stdUser),
        name: obj.name,
        official: obj.official,
        publishDelay: obj.publishDelay,
        twitter: obj.twitter,
        updatedAt: obj.updatedAt,
        verified: obj.verified,
        website: obj.website,
    })
}

function stdList(obj) {
    if (!obj) return obj;
    return clean({
        id: obj.id,
        manga: stdManga(obj.manga),
        name: obj.name,
        owner: stdUser(obj.owner),
        public: obj.public,
        version: obj.version,
        visibility: obj.visibility,
    })
}

function stdManga(obj) {
    if (!obj) return obj;
    return clean({
        id: obj.id,
        aggregate: obj.aggregate,
        actualChapterCount: obj.actualChapterCount,
        altTitles: obj.altTitles,
        artists: obj.artists?.map(stdAuthor),
        authors: obj.authors?.map(stdAuthor),
        chapterCount: obj.chapterCount,
        contentRating: obj.contentRating,
        covers: obj.covers?.map(stdCover),
        createdAt: obj.createdAt,
        description: obj.description,
        follows: obj.follows,
        isLocked: obj.isLocked,
        lastChapter: obj.lastChapter,
        lastVolume: obj.lastVolume,
        links: obj.links,
        localizedAltTitles: obj.localizedAltTitles,
        localizedDescription: obj.localizedDescription,
        localizedTitle: obj.localizedTitle,
        mainCover: stdCover(obj.mainCover),
        originalLanguage: obj.originalLanguage,
        publicationDemographic: obj.publicationDemographic,
        rating: obj.rating,
        readChapterIds: obj.readChapterIds,
        readingStatus: obj.readingStatus,
        relatedManga: obj.relatedManga ? Object.entries(obj.relatedManga).reduce((acc, [k, v]) => {
            acc[k] = v?.map(stdManga);
            return acc;
        }, {}): obj.relatedManga,
        statistics: obj.statistics,
        status: obj.status,
        tags: obj.tags,
        title: obj.title,
        updatedAt: obj.updatedAt,
        volumeCount: obj.volumeCount,
        version: obj.version,
        year: obj.year,
    })
}

function stdUser(obj) {
    if (!obj) return obj;
    return clean({
        id: obj.id,
        groups: obj.groups?.map(stdGroup),
        roles: obj.roles,
        username: obj.username,
    })
}