import { Typography } from '@material-ui/core';
import { TimelapseOutlined } from '@material-ui/icons';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';


/** @param {UpdateDetails.propTypes} props */
function UpdateDetails(props) {
    return (
        <Container className='upload-details' >
            <div className='time' >
                <TimelapseOutlined />
                <Typography variant='subtitle2' >
                    {moment(props.updateDate).fromNow()}
                </Typography>
            </div>
            <div className='chapter' >
                <Typography variant='subtitle2' >
                    {props.chapterNum && `Ch ${Number.parseInt(props.chapterNum)}`}
                </Typography>
            </div>
        </Container>
    )
}

const Container = styled.div`
    display: flex;
    align-items: center;
    svg {
        font-size: 1.2rem;
        fill: ${({theme}) => theme.palette.text.secondary};
    }
    >.time {
        display: flex;
        align-items: center;
        gap: .1rem;
    }
    >.chapter {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }
`;


UpdateDetails.propTypes = {
    updateDate: PropTypes.oneOfType([
        PropTypes.instanceOf(Date),
        PropTypes.string, PropTypes.number,
    ]),
    chapterNum: PropTypes.oneOfType([
        PropTypes.string, PropTypes.number,
    ]),
}

export default UpdateDetails

