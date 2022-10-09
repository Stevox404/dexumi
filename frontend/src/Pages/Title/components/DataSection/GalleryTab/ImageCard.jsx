import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types';
import styled from 'styled-components';
import manga404 from 'Assets/images/manga-404.jpg';
import loadingGif from 'Assets/images/loading.gif';
import {
    Card as MuiCard, CardActionArea, CardMedia
} from '@material-ui/core';
import { getEntityImageSrc } from 'Utils';
import Img from 'Components/shared/Img';


function ImageCard(props) {
    const coverImgRef = useRef(null);
    useEffect(() => {
        if (!props.cover) return;
        fetchCover();
    }, [props.manga]);

    const fetchCover = async _ => {
        /**@type {import('mangadex-full-api').Cover} */
        const cover = props.cover;
        let coverUrl = getEntityImageSrc(cover);
        const img = new Image();
        img.src = coverUrl;
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

    const onCoverError = (e) => {
        /**@type {HTMLImageElement} */
        const el = coverImgRef.current;
        el.src = '';
    }

    return (
        <Card>
            <CardMedia
                image={manga404}
                title={props.cover.description}
            >
                <Img
                    src={loadingGif} loading="lazy" ref={coverImgRef}
                    alt={props.cover.description + ' cover'}
                    onError={onCoverError}
                />
            </CardMedia>
        </Card>
    )
}


const Card = styled(MuiCard)`
    min-height: 24rem;
    .MuiCardMedia-root {
        background-size: 100%;
        height: 100%;
        img {
            inline-size: 100%;
            block-size: 100%;
            object-fit: cover;
        }
    }
`;


ImageCard.propTypes = {
    cover: PropTypes.object,
}

export default ImageCard;
