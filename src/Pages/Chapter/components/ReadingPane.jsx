import { Skeleton } from '@material-ui/lab';
import Img from 'Components/shared/Img';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { debounce } from 'Utils';

/**@param {ReadingPane.propTypes} props */
function ReadingPane(props, readingPaneRef) {
    const imgBoxRef = useRef(null);
    const prePg = useRef([]);
    const [observedEl, setObservedEl] = useState();

    /**
     * @param {IntersectionObserverEntry[]} entries 
     * @param {IntersectionObserver} observer 
     */
    const handlePageEnter = (entries, observer) => {
        for (let i = 0, l = entries.length; i < l; i++) {
            const entry = entries[i];
            if (entry.isIntersecting && (
                entry.boundingClientRect.top > entry.rootBounds.top ||
                entry.boundingClientRect.bottom < entry.rootBounds.bottom
            )) {
                /**@type {HTMLDivElement} */
                const el = entry.target;
                setObservedEl(el);
                const pg = el.getAttribute('data-page');
                props.onChangePage(undefined, pg, true);
                break;
            }
        }
    }

    const [observer] = useState(
        new IntersectionObserver(handlePageEnter, { threshold: .1 })
    );


    useEffect(() => {
        if (!props.chapter) return;
        /**@type {HTMLDivElement} */
        const imgBox = imgBoxRef.current;
        if (!imgBox) return;
        if (
            props.readerSettings.displayMode === 'all' ||
            props.readerSettings.displayMode === 'webcomic'
        ) {
            const pg = imgBox.querySelector(`#page-${props.currentPage}`);
            if (!pg) return;
            if (observedEl?.id === `page-${props.currentPage}`) return;
            pg.scrollIntoView();
        }
    }, [props.currentPage, props.readerSettings.displayMode, imgBoxRef.current, props.chapter]);

    /**@param {import('react').SyntheticEvent} e */
    const handlePageNav = e => {
        let skipNum = 1, dir = 1;
        if (e.nativeEvent instanceof KeyboardEvent) {
            if (e.code === 'ArrowRight') {
                dir = 1;
            } else if (e.code === 'ArrowLeft') {
                dir = -1;
            } else {
                return;
            }
        } else {
            return;
        }

        if (
            props.readerSettings.displayMode === 'all' ||
            props.readerSettings.displayMode === 'webcomic' 
        ) {
            return;
        }

        if (props.readerSettings.readingDir == 'left') {
            dir *= -1;
        }


        if (props.readerSettings.displayMode === 'double') {
            const pg = props.currentPage;
            if(shouldSkipPg(pg)) {
                skipNum = 2;
            }

            function shouldSkipPg(pg) {
                const prevPg = pg - 1;
                const nextPg = pg + 1;
                if (dir < 0 && isLandscapePage(prevPg)) return false;
                if (dir > 0 && isLandscapePage(pg)) return false;
                if (dir > 0 && isLandscapePage(nextPg)) return false;
                return true;
            }
        }

        /**@type {HTMLDivElement} */
        const imgBox = imgBoxRef.current;
        if (
            props.readerSettings.displayMode !== 'all' &&
            props.readerSettings.displayMode !== 'webcomic' &&
            imgBox
        ) {
            imgBox.style.scrollBehavior = 'unset';
            if (dir > 0) {
                imgBox.scrollTo(0, 0);
            } else {
                imgBox.scrollTo(0, imgBox.scrollHeight);
            }
            window.setTimeout(() => {
                imgBox.style.scrollBehavior = 'smooth';
            }, 0)
        }
        const newPage = Number(props.currentPage) + (dir * skipNum)
        props.onChangePage(e, newPage);
    }

    /**@param {import('react').SyntheticEvent} e */
    const handlePageScroll = e => {
        let dist = props.readerSettings.arrowScrollSize;
        if (e.nativeEvent instanceof KeyboardEvent) {
            if (e.code === 'ArrowUp') {
                dist *= -1;
            } else if (e.code === 'ArrowDown') {
                dist *= 1
            } else {
                return;
            }
        } else {
            return;
        }
        /**@type {HTMLDivElement} */
        const container = e.target;
        if(container.scrollTop === 0 && dist < 0) return;
        if(container.scrollTop === container.scrollHeight && dist > 0) return;
        window.setTimeout(() => {
            container.scrollBy(0, dist);
        }, 0);
    }

    const smoothScroll = useCallback(debounce(handlePageScroll, 50),[])
    
    /**@param {KeyboardEvent} e */
    const handleKeyPress = e => {
        handlePageNav(e);
        if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
            smoothScroll(e)
        }
    }

    const preload = () => {
        if (props.fetcing || !props.chapter) {
            return;
        }
        // @todo If at end of chapter, preload next chapter
        const num = (props.readerSettings.preloadPages === -1) ? 
            props.chapter.pages.length : props.readerSettings.preloadPages;

        const l = Math.min(props.currentPage + num, props.chapter.pages.length);

        for (let i = props.currentPage; i < l; i++) {
            const src = props.chapter.pages[i];
            if(prePg.current[i]?.src === src) {
                continue;
            }
            const img = new Image();
            img.src = src;
            prePg.current[i] = img;
        }
    }

    const getPageImages = () => {
        if (props.fetcing || !props.chapter) {
            return <Skeleton variant='rect' />;
        }
        if (props.readerSettings.displayMode === 'single') {
            preload();
            return <Img
                id={`page-${props.currentPage}`} data-page={props.currentPage}
                src={props.chapter.pages[props.currentPage]}
                alt={`page ${props.currentPage}`}
            />
        }
        if (props.readerSettings.displayMode === 'double') {
            preload();

            let pg1 = props.currentPage;
            let pg2 = props.currentPage + 1;
            
            if(isLandscapePage(pg1)) {
                return getPageImage(pg1, {double: true});
            }

            const pages = [getPageImage(pg1)];
            if (isLandscapePage(pg2)) {
                pages.push(getBlankPageImage(pg1));
            } else {
                pages.push(getPageImage(pg2));
            }
            
            if (props.readerSettings.readingDir == 'left') {
                [pages[0], pages[1]] = [pages[1], pages[0]];
            }   

            return <>{pages}</>;

            function getPageImage(pg, {double = false} = {}) {
                let className = [];
                if(double) className.push('double')
                className = className.join(' ');
                
                return <Img
                    id={`page-${pg}`} className={className} data-page={pg}
                    alt={`page ${pg}`} src={props.chapter.pages[pg]}
                />
            }
            function getBlankPageImage(pg) {
                return <Img
                    id={`blank-${pg}`} alt={`blank page`}
                />
            }
        }
        return props.chapter.pages.map((p, idx) =>
            <Img
                key={p} id={`page-${idx}`} src={p} alt={`page ${idx}`}
                data-page={idx} ref={el => el && observer.observe(el)}
            />
        )
    }

    function isLandscapePage(pg) {
        const img = prePg.current[pg];
        if (img && img.complete && img.naturalHeight > 0) {
            if(img.naturalWidth > img.naturalHeight) {
                return true;
            }
        }
        return false;
    }

    const setPaneRefs = ref => {
        imgBoxRef.current = ref;
        if (readingPaneRef) {
            readingPaneRef.current = ref;
        }
    }

    return (
        <Wrapper
            data-image-size={props.readerSettings.imageSize}
            data-display-mode={props.readerSettings.displayMode}
            onKeyDown={handleKeyPress} tabIndex='0' autoFocus
            ref={setPaneRefs}
        >
            {getPageImages()}
        </Wrapper>
    )
}



const Wrapper = styled.div`
    width: 100%;
    max-width: 100%;
    display: grid;
    justify-items: center;
    margin: 0 auto;
    overflow: auto;
    height: 100%;
    scroll-behavior: smooth;
    /* transition: width 50ms ease-out 0ms; */
    gap: 2rem;
    ${p => {
        switch (p['data-display-mode']) {
            case 'double': return css`
                grid-template-columns: 1fr 1fr;
                align-items: center;
                img:first-child {
                    justify-self: end;
                }
                img:last-child {
                    justify-self: start;
                }
                
                img.double {
                    justify-self: center;
                    grid-column: span 2;
                }
            `;
            case 'webcomic': return css`
                gap: 0;
            `;
        }
    }}

    .MuiSkeleton-root {
        width: 90%;
        height: 100%;
    }
    img {
        display: grid;
        justify-content: center;
        width: auto;
        height: auto;
        ${p => {
        switch (p['data-image-size']) {
            case 'fit-width': return css`
                max-width: 100%;
            `;
            case 'fit-height': return css`
                    max-height: 100vh;
            `;
        }
    }}
    }
`;




ReadingPane.defaultProps = {
    readerSettings: {
        displayMode: 'all',
        imageSize: 'fit-width',
        arrowScrollSize: 420,
        preloadPages: 5,
    },
}

ReadingPane.propTypes = {
    chapter: PropTypes.object,
    currentPage: PropTypes.number,
    readerSettings: PropTypes.shape({
        displayMode: PropTypes.string,
        imageSize: PropTypes.string,
        arrowScrollSize: PropTypes.number,
        preloadPages: PropTypes.number,
    }),
}

export default React.forwardRef(ReadingPane);

