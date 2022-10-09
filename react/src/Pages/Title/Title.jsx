import { SystemAppBar } from 'Components';
import { DataSection, MainSection } from './components';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { addNotification } from 'Redux/actions';
import styled from 'styled-components';
import { getEntityImageSrc, getLocalizedString, resolveManga } from 'Utils';


function Title() {
    const params = useParams();
    const [manga, setManga] = useState();
    const [fetching, setFetching] = useState(true);
    const language = useSelector(state => state.language);
    const [chaptersNum, setChaptersNum] = useState('--');

    const dispatch = useDispatch();

    const fetchManga = async () => {
        try {
            const id = params.id;
            const manga = await resolveManga(id, {
                aggregate: true,
                covers: true,
                readChapterIds: true,
                readingStatus: true,
                authors: true,
                artists: true,
                mainCover: true,
                statistics: true,
            });
            
            manga.tags.forEach(t => {
                // Genre, format, content, themes,
                const val = getLocalizedString(t.localizedName);
                if (Array.isArray(manga[t.group])) {
                    manga[t.group].push(val);
                } else {
                    manga[t.group] = [val];
                }
            });
            setManga(manga);
            setChaptersNum(manga.chapterCount);
        } catch (err) {
            console.error(err);
            if (/TypeError/.test(err.message)) {
                dispatch(addNotification({
                    message: "Check your network connection",
                    group: 'network',
                    persist: true,
                }));
            }
        } finally {
            setFetching(false);
        }
    }

    useEffect(() => {
        fetchManga();
    }, [])

    useEffect(() => {
        if (!manga) return;
        document.title = `${manga.title} - Dexumi`;
    }, [manga]);

    return (
        <>
            <SystemAppBar />
            <Wrapper className='page fill-screen' data-main-cover={getEntityImageSrc(manga?.mainCover, 'imageSource')} >
                <div id='hero-img' />
                <div className='content' >
                    <MainSection
                        fetching={fetching}
                        manga={manga}
                    />
                    <DataSection
                        manga={manga}
                    />
                </div>
            </Wrapper>
        </>
    )
}

const Wrapper = styled.div`
    #hero-img {
        /* height: 170px; */
        height: 240px;
        background-image: linear-gradient(#000a, #0005), url(${p => p['data-main-cover']});
        background-size: cover;
        background-position: 0 25%;
        background-attachment: fixed;
    }
    .content {
        padding: 3rem;
        padding-top: 1rem;
        ${({ theme }) => theme.breakpoints.down('sm')} {
            padding: 1rem 0;
        }
    }

    ${({ theme }) => theme.breakpoints.down('md')}{
        .content {
            padding-top: 0;
            height: 100vh;
            scroll-snap-type: y proximity;
            overflow-y: auto;
        }
        #hero-img {
            display: none;
        }
    }
`;

export default Title;
