import {
    AppBar, IconButton, List, Paper, Tab, Tabs
} from '@material-ui/core';
import { SettingsOutlined } from '@material-ui/icons';
import { useRouter } from 'flitlib';
import { Manga as MfaManga } from 'mangadex-full-api';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from 'Redux/actions';
import styled from 'styled-components';
import ChapterListSettings from './ChapterListSettings';
import InfoTab from './InfoTab';
import ChaptersTab from './ChaptersTab';
import GalleryTab from './GalleryTab/index';
import { DexCache } from 'Utils/StorageManager/DexCache';
import { resolveChapter } from 'Utils/mfa';
import { standardize } from 'Utils/Standardize';
import { DexDM, isOnline } from 'Utils';

/** @param {DataSection.propTypes} props */
function DataSection(props) {
    const [tabIndex, setTabIndex] = useState(1);
    const [chapterSettingsOpen, setChapterSettingsOpen] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [chapters, setChapters] = useState([]);
    const [readership, setReadership] = useState({});
    const [chapterPage, setChapterPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { changePage } = useRouter();
    const language = useSelector(state => state.language);
    const dispatch = useDispatch();

    const [chapterSettings, setChapterSettings] = useState({
        sortOrder: 'chapter-desc',
        group: 'all',
        displayDate: 'updatedAt',
        grouped: false,
    });


    const memoizedFetchOpts = useRef(null);

    function shouldFetch() {
        const opts = memoizedFetchOpts.current;

        const changed = !opts ||
            opts.mangaId != props.manga.id ||
            opts.sortOrder != chapterSettings.sortOrder ||
            opts.rowsPerPage != rowsPerPage ||
            opts.chapterPage != chapterPage;

        if (!changed) return false;
        memoizedFetchOpts.current = {
            mangaId: props.manga?.id,
            sortOrder: chapterSettings?.sortOrder,
            rowsPerPage,
            chapterPage,
        }
        return true;
    }

    const fetchChapters = async _ => {
        if (!props.manga) return;
        if (!shouldFetch()) return;

        try {
            setFetching(true);
            /**@type {MfaManga} */
            const manga = props.manga;
            let chapters;
            const sort = chapterSettings.sortOrder.split('-');
            const params = {
                order: {
                    [sort[0]]: sort[1]
                },
                offset: chapterPage * rowsPerPage,
                limit: rowsPerPage,
                translatedLanguage: [language]
            }
            if (chapterSettings.paginated) {
                params.limit = rowsPerPage;
                params.offset = chapterPage * rowsPerPage;
            }
            
            if(isOnline()) {
                const chFeed = await MfaManga.getFeed(manga.id, params);
                chapters = await Promise.all(chFeed.map(async ch =>
                    resolveChapter(ch, {
                        groups: true,
                    })
                ));
            } else {
                chapters = await DexDM.getDownloadedChapters(manga.id, params);
            }

            setChapters(chapters);
        } catch (err) {
            console.error(err);
            dispatch(addNotification({
                message: "Check your network connection and refresh",
                group: 'network',
                persist: true
            }))
        } finally {
            setFetching(false);
        }
    }


    useEffect(() => {
        if (!props.manga) return;
        setReadership(props.manga.readChapterIds);
        fetchChapters();
    }, [props.manga]);

    useEffect(() => {
        fetchChapters();
    }, [chapterPage, rowsPerPage]);

    useEffect(() => {
        fetchChapters();
    }, [chapterSettings]);

    const handleTabChange = (e, idx) => {
        setTabIndex(idx);
    }

    const showChapterSettings = (e) => {
        setChapterSettingsOpen(true);
    }

    const handleChapterClick = (e, chapter) => {
        if (chapter.isExternal) {
            if (!chapter.externalUrl) {
                return window.alert('Chapter is hosted externally but no link provided');
            }
            const a = document.createElement('a');
            a.href = chapter.externalUrl;
            a.target = '_blank';
            document.body.append(a);
            a.click();
            document.body.removeChild(a);
        } else {
            changePage(`/chapter/${chapter.id}/1`);
        }
    }

    /**
     * @param {import('react').MouseEvent} e 
     * @param {number} page 
     */
    const handleChangePage = (e, page) => {
        setChapterPage(page);
    }


    /**
     * @param {import('react').ChangeEvent} e 
     */
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(e.target.value);
    }


    const getTabPanel = () => {
        switch (tabIndex) {
            case 0: return <InfoTab manga={props.manga} />;
            case 1: return <ChaptersTab
                fetching={fetching}
                manga={props.manga}
                chapters={chapters}
                readership={readership}
                totalChapterCount={props.manga?.chapterCount}
                page={chapterPage}
                chapterSettings={chapterSettings}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                handleChapterClick={handleChapterClick}
            />
            case 2: return <GalleryTab manga={props.manga} />;
            default: break;
        }
    }

    const getTabActions = () => {
        switch (tabIndex) {
            case 1: return <>
                <IconButton onClick={showChapterSettings} >
                    <SettingsOutlined />
                </IconButton>
            </>;
            default: break;
        }
    }


    const handleChapterSettingChange = e => {
        const key = e.target.name;
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setChapterSettings(s => ({ ...s, [key]: val }));
    }

    if (!props.manga) return null; // todo show loading

    return (
        <Container square>
            <AppBar position="sticky" color="default" >
                <Tabs
                    value={tabIndex}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={handleTabChange}
                >
                    <Tab label="Info" />
                    <Tab label="Chapters" />
                    <Tab label="Gallery" />
                </Tabs>
                <div id="actions">
                    {getTabActions()}
                </div>
            </AppBar>
            <div className='tab-panel' >
                {getTabPanel()}
            </div>

            <ChapterListSettings
                open={chapterSettingsOpen} onClose={_ => setChapterSettingsOpen(false)}
                sortOrder={chapterSettings.sortOrder}
                group={chapterSettings.group}
                displayDate={chapterSettings.displayDate}
                grouped={chapterSettings.grouped}
                onChange={handleChapterSettingChange}
            />
        </Container>
    )
}


const ChapterTab = styled(List)`
    .MuiListItem-root {
        display: grid;
        grid-template-columns: 1fr auto;
        &[data-read="true"] {
            &:not(:hover){
                background-color: ${p => p.theme.palette.background.default};
            }
            .MuiTypography-root {
                color: ${p => p.theme.palette.text.secondary};
            }
        }
    }
    .MuiSkeleton-root {
        margin-bottom: .4rem;
    }
`;

const Container = styled(Paper)`
    .tab-panel {
        min-height: 50vh;
        padding-bottom: 4.8rem;
        display: flex;
        background-color: ${({ theme }) => theme.palette.background.paper};
        z-index: 1;
        position: relative;
        &>* {
            flex: 1;
        }
    }
    #actions {
        position: absolute;
        top: 0;
        right: 0;
    }

    ${({ theme }) => theme.breakpoints.down('md')}{
        scroll-snap-align: start;
    }
`;



DataSection.propTypes = {
    manga: PropTypes.object,
}

export default DataSection;

