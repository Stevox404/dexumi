import { Button, Divider, IconButton, MenuItem, TextField, Toolbar, Tooltip, Typography, useMediaQuery } from '@material-ui/core';
import { AspectRatio, AspectRatioOutlined, CommentOutlined, KeyboardArrowLeftOutlined, KeyboardArrowRightOutlined, Settings, SettingsOverscanOutlined, WebAssetOutlined } from '@material-ui/icons';
import Close from '@material-ui/icons/Close';
import SideDrawer from 'Components/shared/mui-x/SideDrawer';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Flag from 'react-world-flags';
import { Link } from 'react-router-dom';

/**@param {SidePane.propTypes} props */
function SidePane(props) {
    const [inZenMode, setInZenMode] = useState(false);
    var isUnderSm = useMediaQuery(theme => theme.breakpoints.down('sm'));
    
    useEffect(() => {
        /**@type {HTMLElement} */
        const elem = props.readingPaneRef.current;
        if (!elem) return;
        window.document.addEventListener('keyup', fn);
        return _ => window.document.removeEventListener('keyup', fn);
        function fn(ev) {
            if (ev.key === 'f') toggleZenMode(ev);
        }
    }, [props.readingPaneRef, inZenMode]);

    useEffect(() => {
        /**@type {HTMLElement} */
        window.document.addEventListener('fullscreenchange', fn);
        return _ => window.document.removeEventListener('fullscreenchange', fn);
        function fn(ev) {
            if (!window.document.fullscreenElement) {
                setInZenMode(false);
            }
        }
    }, [props.readingPaneRef, inZenMode]);


    const getChapterNumText = () => {
        if (!props.chapter) return 'Ch';
        let txt = '';
        if (props.chapter.volume) txt += `Vol ${props.chapter.volume} `;
        if (props.chapter.chapter) {
            txt += `Ch ${props.chapter.chapter}`;
        } else txt += `One-Shot`;
        return txt;
    }

    const changeChapter = e => {
        if (!props.chapter) return;
        let dir = e.currentTarget.getAttribute('data-btn-side') === 'left' ? -1 : 1;
        if (
            props.readerSettings.readingDir === 'left' &&
            !props.readerSettings.reverseNavBtns
        ) dir *= -1;

        if (dir > 0) {
            props.onNextChapterClick();
        } else props.onPrevChapterClick();
    }

    const toggleZenMode = _ => {
        /**@type {HTMLElement} */
        const elem = props.readingPaneRef.current;
        if (!elem) return;

        try {
            if (!inZenMode) {
                if (!window.document.fullscreenElement) {
                    if (elem.requestFullscreen) {
                        elem.requestFullscreen();
                    } else if (elem.webkitRequestFullscreen) { /* Safari */
                        elem.webkitRequestFullscreen();
                    } else if (elem.msRequestFullscreen) { /* IE11 */
                        elem.msRequestFullscreen();
                    }
                }
                setInZenMode(true);
            } else {
                if (window.document.fullscreenElement) {
                    window.document.exitFullscreen();
                }
                setInZenMode(false);
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <Container
            open={props.open} anchor='right' onClose={props.onClose}
            variant={isUnderSm ? 'temporary': 'permanent'} maxWidth={'300px'}
        >
            <div id="drawer">
                <div id="title">
                    <Link to={`/title/${props.chapter?.manga.id}`} >
                        <Typography
                            id='title' color='secondary' variant='h6'
                        >
                            {props.chapter?.manga.title}
                        </Typography>
                    </Link>
                    <Flag code={props.chapter?.manga.originalLanguage} height={16} />
                </div>
                <Divider />
                {props.chapter?.title &&
                    <Typography variant='body2' id='chapter-title' >
                        {props.chapter.title}
                    </Typography>
                }
                <div id='chapter' >
                    <div className='btn' >
                        <IconButton data-btn-side='left' onClick={changeChapter} >
                            <KeyboardArrowLeftOutlined />
                        </IconButton>
                        <Typography variant='subtitle2' >
                            {(
                                props.readerSettings.readingDir === 'left' &&
                                !props.readerSettings.reverseNavBtns
                            ) ? 'NEXT' : 'PREV'}
                        </Typography>
                    </div>
                    <div id="chapter-num">
                        <Typography>
                            {getChapterNumText()}
                        </Typography>
                    </div>
                    {/* <TextField size='small' readOnly value={getChapterNumText()} /> */}
                    <div className='btn' >
                        <IconButton data-btn-side='right' onClick={changeChapter} >
                            <KeyboardArrowRightOutlined />
                        </IconButton>
                        <Typography variant='subtitle2' >
                            {(
                                props.readerSettings.readingDir === 'left' &&
                                !props.readerSettings.reverseNavBtns
                            ) ? 'PREV': 'NEXT'}
                        </Typography>
                    </div>
                </div>
                <Divider />
                <div id='scanlator' >
                    <Flag code={'us'} height={16} />
                    <Typography variant='subtitle1' >
                        {props.chapter?.groups[0]?.name}
                    </Typography>
                </div>
                <Divider />
                <div id="actions">
                    <Button variant='outlined' onClick={props.onShowSettings} >
                        <Settings />
                        Settings
                    </Button>
                    <div>
                        <Tooltip title='Toolbar' onClick={props.onToolbarToggle} >
                            <Button variant='outlined' >
                                <WebAssetOutlined />
                            </Button>
                        </Tooltip>
                        <Tooltip title='Zen Mode [F]' >
                            <Button variant='outlined' onClick={toggleZenMode} >
                                <AspectRatioOutlined />
                            </Button>
                        </Tooltip>
                        <Tooltip title='Comments' >
                            <Button variant='outlined' >
                                <CommentOutlined />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
                <Divider />
            </div>
        </Container>
    )
}

const Container = styled(SideDrawer)`
    #drawer {
        height: 100%;
        overflow-y: auto;
        padding-bottom: 4rem;

        > * {
            padding-left: .8rem;
            padding-right: .8rem;
        }
        #title {
            display: grid;
            width: 100%;
            grid-template-columns: auto;
            justify-content: center;
            align-items: center;
            column-gap: .4rem;
            .MuiTypography-root {
                display: block;
                text-align: center;
            }
        }
        #chapter-title {
            text-align: center;
        }
        .MuiDivider-root {
            margin: .6rem 0;
        }
        #chapter {
            display: flex;
            align-items: flex-start;
            align-items: center;
            .btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                .MuiTypography-root {
                    font-size: .64rem;
                }
            }
            .MuiTextField-root {
                flex: 1;
                pointer-events: none;
            }
            #chapter-num {
                flex: 1;
                pointer-events: none;
                border: 1px solid ${p => p.theme.palette.action.disabled};
                border-radius: 4px;
                text-align: center;
                padding: .24rem;
            }
        }
        #scanlator {
            display: flex;
            align-items: center;
            .MuiTypography-root {
                font-weight: bold;
                margin-left: .4rem;
            }
        }
        #actions {
            display: flex;
            flex-direction: column;
            gap: .4rem;
            > div {
                display: flex;
                gap: .4rem;
                > * {
                    flex: 1;
                }
            }
        }

    }
`;

SidePane.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onShowSettings: PropTypes.func.isRequired,
    chapter: PropTypes.object,
    readerSettings: PropTypes.object,
    onNextChapterClick: PropTypes.func.isRequired,
    onPrevChapterClick: PropTypes.func.isRequired,
    onToolbarToggle: PropTypes.func.isRequired,
}

export default SidePane;

