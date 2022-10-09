import { Typography } from '@material-ui/core';
import { 
    StarBorderOutlined, StarHalfOutlined, StarOutlined,
    Bookmark,
} from '@material-ui/icons';
import React from 'react';
import styled from 'styled-components';
import { abbreviateNumber, getStars } from 'Utils';
import PropTypes from 'prop-types';


/** @param {PopularityDetails.propTypes} props */
function PopularityDetails(props) {
    return (
        <Container >
            <div className='follows' >
                <Bookmark />
                <Typography variant='subtitle2' >
                    {abbreviateNumber(Number.parseInt(props.follows) || 0)}
                </Typography>
            </div>
            <div className='rating' >
                {getStars(props.rating)}
            </div>
        </Container>
    )
}

const Container = styled.div`
    display: flex;
    align-items: center;
    svg {
        font-size: 1.2rem;
    }
    >.follows {
        display: flex;
        align-items: center;
        gap: .1rem;
        svg {
            fill: ${({theme}) => theme.palette.text.secondary};
        }
    }
    >.rating {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        svg {
            fill: ${({theme}) => theme.palette.primary.main};
        }
    }
`;


PopularityDetails.propTypes = {
    follows: PropTypes.number,
    rating: PropTypes.number,
}

export default PopularityDetails

