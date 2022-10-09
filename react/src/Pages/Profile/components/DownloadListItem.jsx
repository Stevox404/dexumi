import { IconButton, ListItem, ListItemText } from '@material-ui/core';
import { Cancel, KeyboardArrowDown, KeyboardArrowUp, Pause } from '@material-ui/icons';
import React from 'react';
import styled from 'styled-components';

export function DownloadListItem(props) {
    return (
        <StyledListItem>
            <div id='order'>
                <IconButton aria-label="move-up" size='small'>
                    <KeyboardArrowUp />
                </IconButton>
                <IconButton aria-label="move-down" size='small'>
                    <KeyboardArrowDown />
                </IconButton>
            </div>
            <ListItemText
                primary={`Naruto - Chapter 456: Friend`}
                secondary={<div id='progress-bar' />} />
            <div id='actions'>
                <IconButton aria-label="pause">
                    <Pause />
                </IconButton>
                <IconButton aria-label="cancel">
                    <Cancel />
                </IconButton>
            </div>
        </StyledListItem>
    );
}

const StyledListItem = styled(ListItem)`
    #order {
        display: grid;
    }
    
    #progress-bar {
        height:3px;
        width: 100%;
        background-color: grey;
        position: relative;
        &::after {
            content: '';
            display: block;
            width: 75%;
            height: 100%;
            background-color: red;

        }
    }

    #actions {
        display: flex;
        gap: .2rem;
        margin-left: 1rem;
    }
`;