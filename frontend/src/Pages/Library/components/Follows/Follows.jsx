import {
    Button
} from '@material-ui/core';
import FollowsList from './FollowsList';
import { Manga as MfaManga } from 'mangadex-full-api';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from 'Redux/actions';
import { DexCache } from 'Utils/StorageManager';
import { standardize } from 'Utils/Standardize';
import styled from 'styled-components';

const cache = new DexCache();
cache.name = 'follows';

const readCache = new DexCache();
readCache.name = 'readership';

function Follows(props) {
    const [fetching, setFetching] = useState(true);
    const [readership, setReadership] = useState({});
    const language = useSelector(state => state.language);
    /**@type {[import('mangadex-full-api').Chapter[]]} */
    const [feed, setFeed] = useState([]);


    const dispatch = useDispatch();

    const fetchFollows = async () => {
        setFetching(true);
        try {
            let follows = await cache.fetch();
            if (!follows) {
                const feed = await MfaManga.getFollowedFeed({
                    updatedAtSince: moment().subtract(2, 'months').format('YYYY-MM-DDThh:mm:ss'),
                    translatedLanguage: [language],
                    order: {
                        updatedAt: 'desc'
                    },
                });
                const resolvedFeed = await Promise.all(feed.map(f => resolveChapter(f)));

                follows = resolvedFeed.map(standardize);

                // Add show more button. Fetch in groups of 10?
                cache.data = follows;
                cache.save();
            }
            fetchReadership(follows);
            setFeed(follows);
        } catch (err) {
            if (/TypeError/.test(err.message)) {
                dispatch(addNotification({
                    message: "Check your network connection",
                    group: 'network',
                    persist: true,
                }));
            } else {
                throw err;
            }
        } finally {
            setFetching(false);
        }
    }

    const fetchReadership = async (manga) => {
        const ids = Array.from(new Set(manga.map(m => m.manga.id)));
        try {
            let readership = await readCache.fetch();
            if (!readership) {
                readership = await MfaManga.getReadChapterIds(ids);
                readership = readership.reduce((agg, chId) => {
                    agg[chId] = true
                    return agg;
                }, {});

                readCache.data = readership;
                readCache.save();
            }
            setReadership(readership);
        } catch (err) {
            if (/TypeError/.test(err.message)) {
                dispatch(addNotification({
                    message: "Check your network connection",
                    group: 'network',
                    persist: true,
                }));
            } else {
                throw err;
            }
        } 
    }

    /**@param {import('mangadex-full-api').Chapter} chapter */
    const resolveChapter = chapter => {
        return new Promise(async (resolve) => {
            const [mangaPr, groupPr, uploaderPr] = await Promise.allSettled([
                chapter.manga.resolve(),
                chapter.groups[0]?.resolve(),
                chapter.uploader.resolve()
            ]);

            if (mangaPr.status === 'fulfilled') {
                let manga = mangaPr.value;
                manga.mainCover = await manga.mainCover.resolve();
                chapter.manga = manga;
            }

            chapter.groups = [];
            if (groupPr.status === 'fulfilled') {
                chapter.groups = [groupPr.value];
            }

            if (uploaderPr.status === 'fulfilled') {
                chapter.uploader = uploaderPr.value;
            }

            resolve(chapter);
        })
    }

    useEffect(() => {
        fetchFollows();
    }, [])

    useEffect(() => {
        document.title = `Follows - Dexumi`;
    }, []);


    return (
        <Wrapper>
            <FollowsList
                feed={feed} fetching={fetching} readership={readership}
            />
            <Button variant='outlined' size='large' >
                Fetch More
            </Button>
        </Wrapper>
    );
}

const Wrapper = styled.div`
    >.MuiButton-root {
        display: none;
        margin: 2rem auto;
        width: 50%;
        min-width: 12rem;
        justify-self: center;
    }
`;


Follows.propTypes = {};

export default Follows;
