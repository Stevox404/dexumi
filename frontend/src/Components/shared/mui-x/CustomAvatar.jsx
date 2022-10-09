import React, { useState } from 'react'
import MuiAvatar from '@material-ui/core/Avatar';
import styled, { useTheme } from 'styled-components';
import PropTypes from 'prop-types';
import { Dialog } from '@material-ui/core';

const defaultColors = [
    '#f44336', // red
    '#e91e63', // pink
    '#9c27b0', // purlpe
    '#673ab7', //  deep purlpe
    '#03a9f4', // light blue
    '#2196f3', // blue
    '#4caf50', // green
    '#4caf50', // yellow
    '#ff9800', // orange
];

/**
 * 
 * @param {import('@material-ui/core').AvatarProps} props 
 */
function CustomAvatar(props) {
    const { color, expandable, ...otherProps } = props;
    const children = props.name?.[0];
    const theme = useTheme();
    const [dialogOpen, setDialogOpen] = useState(false);

    const getAvatarColor = () => {
        if (color) {
            if (/^(?:primary|secondary)$/.test(color)) {
                return theme.palette[color].main;
            }
            return color;
        }
        if (!props.name) {
            return theme.palette.secondary.main;
        }
        let seed = props.name.split('').reduce((acc, _, i) => acc + props.name.charCodeAt(i), 0);
        const idx = seed % defaultColors.length;
        return defaultColors[idx] || theme.palette.secondary.main;
    }

    const showDialog = e => {
        if (!expandable || !props.src) return;
        setDialogOpen(true);
    }

    return (
        <>
            <Avatar
                children={children}
                color={getAvatarColor()}
                {...otherProps}
                onClick={showDialog}
            />
            <LightBox open={dialogOpen} src={props.src} onClose={e => setDialogOpen(false)} />
        </>
    )
}


const Avatar = styled(MuiAvatar)`
    &.MuiAvatar-root {
        background-color: ${({ color }) => color || ''};
        cursor: ${({ expandable }) => expandable ? 'pointer' : ''};
    }
`;

const LightBox = props => {
    return (
        <LightBoxDialog maxWidth='xs' fullWidth {...props} >
            <img src={props.src} />
        </LightBoxDialog>
    );
}

const LightBoxDialog = styled(Dialog)`
    img {
        width: 100%;
        height: 100%;
    }
`;




CustomAvatar.propTypes = {
    color: PropTypes.string,
    name: PropTypes.string,
    // Can expand to lightbox
    expandable: PropTypes.bool,
}

export default CustomAvatar
