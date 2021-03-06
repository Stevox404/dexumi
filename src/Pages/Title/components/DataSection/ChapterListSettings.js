import {
    MenuItem, Select, Typography, FormControlLabel, Checkbox
} from '@material-ui/core';
import MuiXDialog from 'Components/shared/mui-x/GenericDialog';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';


function ChapterListSettings(props) {
    return (
        <Dialog
            open={props.open} breakpoint='sm' title='Settings'
            maxWidth='sm' fullWidth hideDialogActions showCloseButton
            onClose={props.onClose}
        >
            <Typography id="sort-order-lbl" component='label'>Sort Order:</Typography>
            <Select
                labelId="sort-order-lbl"
                value={props.sortOrder}
                onChange={props.onChange}
                name='sortOrder'
            >
                <MenuItem value='chapter-desc' >Chapter DESC</MenuItem>
                <MenuItem value='chapter-asc' >Chapter ASC</MenuItem>
                <MenuItem value='updatedAt-desc' >Newest Update</MenuItem>
                <MenuItem value='updatedAt-asc' >Oldest Update</MenuItem>
                <MenuItem value='createdAt-desc' >Latest Publish</MenuItem>
                <MenuItem value='createdAt-asc' >Oldest Publish</MenuItem>
            </Select>

            <Typography id='date-lbl' component='label' >Display Date:</Typography>
            <Select
                labelId="date-lbl"
                name='displayDate'
                value={props.displayDate}
                onChange={props.onChange}
            >
                <MenuItem value='updatedAt' >Update Date</MenuItem>
                <MenuItem value='publishAt' >Publish Date</MenuItem>
            </Select>

            <FormControlLabel
                value={props.grouped}
                onChange={props.onChange}
                name='grouped'
                control={<Checkbox color="primary" />}
                label="Group by volume"
                labelPlacement="start"
                disabled
            />
        </Dialog>
    )
}


/**@type {MuiXDialog} */
const Dialog = styled(MuiXDialog)`
    .MuiDialogContent-root {
        display: grid;
        grid-template-columns: 1fr auto;
        justify-content: space-between;
        row-gap: 1rem;
        .MuiFormControlLabel-root {
            margin: 0;
            justify-self: flex-start;
        }
    }
`;


ChapterListSettings.propTypes = {
    open: PropTypes.bool.isRequired,
}

export default ChapterListSettings;