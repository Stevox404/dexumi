import { Card as MuiCard, CardActionArea, CardContent, CardMedia, Typography } from '@material-ui/core';
import loadingGif from 'Assets/images/loading.gif';
import manga404 from 'Assets/images/manga-404.jpg';
import Img from 'Components/shared/Img';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getEntityImageSrc } from 'Utils';
import PopularityDetails from './PopularityDetails';
import UpdateDetails from './UpdateDetails';




/** 
 * @param {MangaCard.propTypes} props
 * @todo handleEmptyList
 */
function MangaCard(props, ref) {
    const coverImgRef = useRef(null);
    useEffect(() => {
        if (!props.manga) return;
        // TODO wait till in viewport margin
        fetchCover();
    }, [props.manga]);

    const fetchCover = async _ => {        
        let cover = getEntityImageSrc(props.manga.mainCover);
        if (!cover) {
            cover = '404';
        }

        const img = new Image();
        img.src = cover;
        img.onload = e => {
            /**@type {HTMLImageElement} */
            const el = coverImgRef.current;
            if (!el) return;
            el.src = e.target.src;
        }
        img.onerror = e => {
            /**@type {HTMLImageElement} */
            const el = coverImgRef.current;
            if (!el) return;
            el.src = '';
        }
    }


    return (
        <Card ref={ref} component={Link} to={`/title/${props.manga.id}`} >
            <CardActionArea tabIndex='-1' >
                <CardMedia
                    title={props.manga.title}
                >
                    <Img
                        src={loadingGif} loading="lazy" ref={coverImgRef}
                        alt={props.manga.title + ' cover'}
                    />
                </CardMedia>
                <CardContent>
                    <Typography gutterBottom component="h3" >
                        {props.manga.title}
                    </Typography>
                    {props.showPopularity &&
                        <PopularityDetails
                            follows={props.manga.follows} rating={props.manga.rating}
                        />
                    }
                    {props.showUpdate &&
                        <UpdateDetails
                            updateDate={props.manga.updatedAt}
                            chapterNum={props.chapterNum}
                        />
                    }
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

const Card = styled(MuiCard)`
    display: inline-block;
    width: var(--card-width, 13rem);
    flex: none;
    position: relative;
    height: var(--card-height, 16rem);
    .MuiCardActionArea-root {
        height: 100%;
        .MuiCardMedia-root {
            height: 100%;
            background-size: 100%;
            img {
                inline-size: 100%;
                block-size: 100%;
                object-fit: cover;
            }
        }
        .MuiCardContent-root {
            --card-color: ${({ theme }) => theme.palette.background.paper};
            padding: .4rem;
            position: absolute;
            bottom: 0;
            /* background-color: ${({ theme }) => theme.palette.background.paper}aa; */
            background: linear-gradient(rgba(255, 255, 255, 0), var(--card-color) 30%);
            width: 100%;
            .MuiTypography-body1 {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                display: block;
            }
        }
    }

    &:hover, &:focus-visible, &:focus-within {
        .MuiCardContent-root {
            .MuiTypography-body1 {
                overflow: unset;
                text-overflow: unset;
                white-space: unset;
            }
        }
    }

    &:focus-visible, &:focus-within {
        outline: 2px solid orangered;
    }

    /* Don't display covers if in data-saver mode */
    @media (prefers-reduced-data: reduce) {
        & {
            min-width: var(--width);
            .MuiCardMedia-root {
                display: none;
            }
        }
    }
`;


export default React.forwardRef(MangaCard);


MangaCard.defaultProps = {
    showUpdate: true,
    showPopularity: true,
}

MangaCard.propTypes = {
    manga: PropTypes.object,
    showUpdate: PropTypes.bool,
    showPopularity: PropTypes.bool,
}


