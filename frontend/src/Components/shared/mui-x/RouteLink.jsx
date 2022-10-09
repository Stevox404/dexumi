import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { useRouter } from 'flitlib';
import { Typography } from '@material-ui/core';

/**
 * 
 * @param {import('@material-ui/core').TypographyProps} props 
 */
function RouteLink(props) {
    const {to, children, ...otherProps} = props;
    let {matchParent} = props;
    const { changePage } = useRouter();
    if(/^\./.test(to) && matchParent === undefined){
        matchParent = true;
    }

    return (
        <Wrapper
            component='span' variant='body2' {...otherProps}
        >
            <button 
                className={'link' + (!!to ? ' active':'')}
                onClick={e => {
                    e.preventDefault();
                    changePage(to, { matchParent });
                }}
            >
                {`${children}`}
            </button>
        </Wrapper>
    )
}

/**
 * @type {Typography}
 */
const Wrapper = styled(Typography)`
    >button {
        padding: 0;
        border: 0;
        background: none;
        cursor: default;
        &.active {
            color: ${({ theme }) => theme.palette.primary.main};
            cursor: pointer;
            text-decoration: underline;
        }
    }
    &:not(:last-child)::after{
        content: ' > ';
    }
`;


RouteLink.propTypes = {
    to: PropTypes.string,
    matchParent: PropTypes.bool,
}

export default RouteLink;

