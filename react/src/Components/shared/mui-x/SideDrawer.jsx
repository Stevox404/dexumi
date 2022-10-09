import React from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { Backdrop, Paper, Slide } from '@material-ui/core';

/**@param {SideDrawer.propTypes} props */
function SideDrawer(props) {
    const {
        variant, onClose, anchor, elevation, paperProps, maxWidth, ...extraProps
    } = props;
    const temp = variant === 'temporary';
    const dir = (_ => {
        switch (anchor) {
            case 'right': return 'left';
            case 'top': return 'bottom';
            case 'bottom': return 'top';
            default: return 'right';
        }
    })();
    const anchorCN = (_ => {
        switch (anchor) {
            case 'right': return 'uiSideDrawer-paperAnchorRight';
            case 'top': return 'uiSideDrawer-paperAnchorTop';
            case 'bottom': return 'uiSideDrawer-paperAnchorBottom';
            default: return 'uiSideDrawer-paperAnchorLeft';
        }
    })();

    const maxWidthVal = /%$/.test(maxWidth) ? maxWidth: Number.parseInt(maxWidth) + 'px';


    return (temp ?
        <Wrapper 
            className={`uiSideDrawer-root uiSideDrawer-modal ${props.className || ''}`}
            anchor={anchor} data-max-width={maxWidthVal} {...extraProps}
        >
            <Backdrop open={props.open} onClick={onClose} />
            <Slide in={props.open} direction={dir} timeout={200} >
                <SideDrawerContainer
                    className={`uiSideDrawer-paper ${anchorCN}`} open={props.open}
                    elevation={elevation} data-max-width={maxWidthVal}  square
                    {...paperProps}
                >
                    {props.children}
                </SideDrawerContainer>
            </Slide>
        </Wrapper> :
        <Slide in={props.open} direction={dir} timeout={200} >
            <SideDrawerContainer
                className={`uiSideDrawer-root uiSideDrawer-docked uiSideDrawer-paper ${anchorCN} ${props.className || ''}`} 
                elevation={elevation} open={props.open} square
                data-max-width={maxWidthVal} {...paperProps}
            >
                {props.children}
            </SideDrawerContainer>
        </Slide>
    )
}


/* transition: width .75s ease-out; */
/* overflow-y: auto; */
const Wrapper = styled.div`
    width: 100%;
    /* max-width: ${p => p['data-max-width']}; */
    height: 100%;
    overflow: hidden;
    z-index: ${({ theme }) => theme.zIndex.drawer};
    ${({ anchor, theme }) => css`
        ${anchor}: 0;
        >*:last-child {
            ${anchor}: 0;
            z-index: 1;
            position: absolute;
        }
    `};
    && {
        position: absolute;
    }
    
    ${({ open }) => !open && css`
        width: 0px;
    `};
    
    .MuiBackdrop-root {
        z-index: 1;
    }
`;

const SideDrawerContainer = styled(Paper)`
    width: ${({ open }) => open ? '100%' : '0px'};
    max-width: ${p => p['data-max-width'] || '75%'};
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    z-index: ${({ theme }) => theme.zIndex.drawer};
`;

SideDrawer.defaultProps = {
    variant: 'temporary',
    anchor: 'left',
    maxWidth: 300,
    elevation: 3,
}

SideDrawer.propTypes = {
    open: PropTypes.bool,
    variant: PropTypes.oneOf(['temporary', 'persistent', 'permanent']),
    anchor: PropTypes.oneOf(['left', 'right']),
    onClose: PropTypes.func,
    maxWidth: PropTypes.oneOfType([
        PropTypes.number, PropTypes.string,
    ]),
}


export default SideDrawer;
