import { IconButton, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { 
    CancelOutlined, CloudDownloadOutlined, DeleteForeverOutlined, 
    OpenInNewOutlined, VisibilityOffOutlined, VisibilityOutlined,
    ScheduleOutlined,
    ErrorOutline
} from '@material-ui/icons';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ChapterDl } from 'Utils';
import { markChapterAsRead } from 'Utils/index';

export function ChapterListItem(props) {
    const {
        chapter, ...otherProps
    } = props;

    const [downloadState, setDownloadState] = useState(ChapterDl.downloadStates.NOT_DOWNLOADED);
    const [cDl, setCDl] = useState(null);

    useEffect(() => {
        if (!chapter) return;
        const cDl = new ChapterDl(chapter);
        const state = cDl.getChapterDownloadState();
        setCDl(cDl);
        setDownloadState(state);
    }, [chapter]);

    const downloadChapter = (e) => {
        e.stopPropagation();

        cDl.addToQueue();
        const state = cDl.getChapterDownloadState();
        setDownloadState(state);

        const onEnd = (event) => {
            const dlChapter = event.detail.chapter;
            if (dlChapter.id !== chapter.id) return;
            const hasError = event.detail.hasError;
            if(hasError) {
                return setDownloadState(ChapterDl.downloadStates.DOWNLOAD_ERR);
            }
            setDownloadState(ChapterDl.downloadStates.DOWNLOADED);
            cDl.removeEventListener('end', onEnd);
        }
        cDl.addEventListener('end', onEnd)
    }

    const deleteDownloadedChapter = async (e, c) => {
        e.stopPropagation();
        await cDl.delete();
        setDownloadState(ChapterDl.downloadStates.NOT_DOWNLOADED);
    }
    
    const cancelDownload = async (e) => {
        e.stopPropagation();
        await cDl.cancel();
        setDownloadState(ChapterDl.downloadStates.NOT_DOWNLOADED);
    }


    const changeChapterReadStatus = (e, c) => {
        e.stopPropagation();
        markChapterAsRead(c);
    }

    const getChapterText = (c) => {
        if (!c) return '';
        let txt = c.chapter === null ? 'One-Shot' : `Chapter ${c.chapter}`;
        if (c.title) {
            txt += `: ${c.title}`;
        }

        if (c.isExternal) {
            txt = <>
                <OpenInNewOutlined />
                {txt}
            </>
        }

        return txt;
    }

    const getDownloadButton = (c) => {
        if (downloadState === ChapterDl.downloadStates.DOWNLOADING) {
            return (
                <IconButton
                    edge="end" aria-label="actions"
                    onClick={e => cancelDownload(e)}
                >
                    <CancelOutlined />
                </IconButton>
            );
        } else if (downloadState === ChapterDl.downloadStates.DOWNLOAD_ERR) {
            return (
                <IconButton
                    edge="end" aria-label="actions"
                    onClick={e => downloadChapter(e)}
                >
                    <ErrorOutline />
                </IconButton>
            );
        } else if (downloadState === ChapterDl.downloadStates.DOWNLOADED) {
            return (
                <IconButton
                    edge="end" aria-label="actions"
                    onClick={e => deleteDownloadedChapter(e)}
                >
                    <DeleteForeverOutlined />
                </IconButton>
            );
        } else if (downloadState === ChapterDl.downloadStates.PENDING) {
            return (
                <IconButton
                    edge="end" aria-label="actions"
                    onClick={e => cancelDownload(e)}
                >
                    <ScheduleOutlined />
                </IconButton>
            );
        } else {
            return (
                <IconButton
                    edge="end" aria-label="actions"
                    onClick={e => downloadChapter(e)}
                >
                    <CloudDownloadOutlined />
                </IconButton>
            );
        }
    }

    return <StyledLiatItem
        key={chapter.id} data-read={otherProps.readership?.[chapter.id]} button
        onClick={e => otherProps.handleChapterClick(e, chapter)}
    >
        <ListItemIcon className='read-status' onClick={e => changeChapterReadStatus(e, chapter)}>
            <IconButton edge="start" aria-label="actions">
                {otherProps.readership?.[chapter.id] ?
                    <VisibilityOffOutlined /> :
                    <VisibilityOutlined />}
            </IconButton>
        </ListItemIcon>
        <ListItemText
            primary={getChapterText(chapter)} className='chapter-name'
            secondary={chapter.groups[0]?.name || chapter.uploader.username} />
        <ListItemText
            primary={moment(chapter[otherProps.chapterSettings.displayDate]).fromNow()}
            primaryTypographyProps={{
                variant: 'subtitle1'
            }} />
        {getDownloadButton(chapter)}
    </StyledLiatItem>;
}


const StyledLiatItem = styled(ListItem)`
    .chapter-name {
        flex: 3;
        .MuiTypography-root {
            display: flex;
            align-items: center;
            svg {
                font-size: 1.2rem;
                margin-right: .2rem;    
            }
        }
    }
    
    &[data-read="true"] {
        &:not(:hover){
            background-color: ${p => p.theme.palette.background.default};
        }
        .MuiTypography-root {
            color: ${p => p.theme.palette.text.secondary};
        }
        svg {
            fill: ${p => p.theme.palette.text.disabled};
        } 
    }
`;