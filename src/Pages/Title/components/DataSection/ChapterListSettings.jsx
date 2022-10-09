import {
    MenuItem, Select, Typography, FormControlLabel, Checkbox, useMediaQuery, FormControl, InputLabel,
} from '@material-ui/core';
import MuiXDialog from 'Components/shared/mui-x/GenericDialog';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';


function ChapterListSettings(props) {
    var isUnderSm = useMediaQuery(theme => theme.breakpoints.down('sm'));
    return (
        <Dialog
            open={props.open} breakpoint='sm' title='Settings'
            maxWidth='sm' fullWidth hideDialogActions showCloseButton
            onClose={props.onClose}
        >
            <FormControl >
                {isUnderSm ?
                    <InputLabel htmlFor="sort">Sort Order</InputLabel>:
                    <Typography id='sort-order-lbl' component='label' >Sort Order:</Typography>
                }
                <Select
                    id='sort'
                    labelId="sort-order-lbl"
                    value={props.sortOrder}
                    fullWidth
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
            </FormControl>

            <FormControl >
                {isUnderSm ?
                    <InputLabel htmlFor="date">Display Date</InputLabel>:
                    <Typography id='date-lbl' component='label' >Display Date:</Typography>
                }
                <Select
                    id="date"
                    labelId="date-lbl"
                    name='displayDate'
                    value={props.displayDate}
                    onChange={props.onChange}
                >
                    <MenuItem value='updatedAt' >Update Date</MenuItem>
                    <MenuItem value='publishAt' >Publish Date</MenuItem>
                </Select>
            </FormControl>

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
        row-gap: 1rem;
        justify-content: stretch;
        align-content: flex-start;
        .MuiFormControl-root {
            display: grid;
            grid-template-columns: 1fr 1fr;
            justify-content: space-between;
        }
        .MuiFormControlLabel-root {
            margin: 0;
            justify-self: flex-start;
        }
    }
    
    ${({ theme }) => theme.breakpoints.down('sm')}{
        .MuiDialogContent-root {
            .MuiFormControl-root {
                grid-template-columns: 1fr;
            }
        }
    }
`;


ChapterListSettings.propTypes = {
    open: PropTypes.bool.isRequired,
}

export default ChapterListSettings;