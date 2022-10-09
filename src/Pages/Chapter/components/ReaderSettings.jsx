import {
    Checkbox, Collapse, FormControl, FormControlLabel, InputAdornment, InputLabel, MenuItem, Select,
    TextField, Typography, useMediaQuery
} from '@material-ui/core';
import MuiXDialog from 'Components/shared/mui-x/GenericDialog';
import PropTypes from 'prop-types';
import styled from 'styled-components';


function ReaderSettings(props) {
    var isUnderSm = useMediaQuery(theme => theme.breakpoints.down('sm'));

    return (
        <Dialog
            open={props.open} breakpoint='sm' maxWidth='sm' fullWidth
            hideDialogActions showCloseButton onClose={props.onClose}
            disableBackdropClick={false}
            title='Settings'
        >
            <FormControlLabel
                value={props.readerSettings.showAdvanced}
                onChange={props.onChange}
                name='showAdvanced'
                control={<Checkbox color="secondary" checked={props.readerSettings.showAdvanced} />}
                label="Show Advanced Controls"
                labelPlacement="start"
            />
            
            <FormControl >
                {isUnderSm ?
                    <InputLabel htmlFor="img-size">Image Size</InputLabel> :
                    <Typography id="img-size-lbl" component='label'>Image Size:</Typography>
                }
                <Select
                    id='img-size'
                    labelId="img-size-lbl"
                    value={props.readerSettings.imageSize}
                    onChange={props.onChange}
                    name='imageSize'
                >
                    <MenuItem value='fit-width' >Fit Width</MenuItem>
                    <MenuItem value='fit-height' >Fit Height</MenuItem>
                    <MenuItem value='original' >Original</MenuItem>
                </Select>
            </FormControl>

            <FormControl >
                {isUnderSm ?
                    <InputLabel htmlFor="display-mode">Display Mode</InputLabel> :
                    <Typography id="display-mode-lbl" component='label'>Display Mode:</Typography>
                }
                <Select
                    id='display-mode'
                    labelId="display-mode-lbl"
                    value={props.readerSettings.displayMode}
                    onChange={props.onChange}
                    name='displayMode'
                >
                    <MenuItem value='single' >Single Page</MenuItem>
                    <MenuItem value='double' >Double Page</MenuItem>
                    <MenuItem value='all' >All Pages</MenuItem>
                    <MenuItem value='webcomic' >Webcomic</MenuItem>
                </Select>
            </FormControl>

            <FormControl >
                {isUnderSm ?
                    <InputLabel htmlFor="read-dir">Reading Direction</InputLabel> :
                    <Typography id="read-dir-lbl" component='label'>Reading Direction:</Typography>
                }
                <Select
                    id='read-dir'
                    labelId="read-dir-lbl"
                    value={props.readerSettings.readingDir}
                    onChange={props.onChange}
                    name='readingDir'
                >
                    <MenuItem value='right' >Left to Right</MenuItem>
                    <MenuItem value='left' >Right to Left</MenuItem>
                </Select>
            </FormControl>



            <FormControlLabel
                value={props.readerSettings.mouseClickNav}
                onChange={props.onChange}
                name='mouseClickNav'
                control={<Checkbox color="primary" checked={props.readerSettings.mouseClickNav} />}
                label="Click/Tap Navigation"
                labelPlacement="start"
                disabled
            />

            <Collapse in={props.readerSettings.showAdvanced}>
                <FormControlLabel
                    value={props.readerSettings.reverseNavBtns}
                    onChange={props.onChange}
                    name='reverseNavBtns'
                    control={<Checkbox color="primary" checked={props.readerSettings.reverseNavBtns} />}
                    label="Reverse Chapter Navigation Button Direction"
                    labelPlacement="start"
                />
                <TextField
                    fullWidth
                    label='Arrow Scroll Distance'
                    value={props.readerSettings.arrowScrollSize}
                    onChange={props.onChange}
                    type='number'
                    name='arrowScrollSize'
                    InputProps={{
                        endAdornment: <InputAdornment position="end">px</InputAdornment>
                    }}
                />
                <TextField
                    fullWidth
                    label='Preload Pages'
                    value={props.readerSettings.preloadPages}
                    onChange={props.onChange}
                    type='number'
                    name='preloadPages'
                    helperText='Set to -1 to preload full chapter'
                    inputProps={{
                        min: -1
                    }}
                />
            </Collapse>
        </Dialog>
    )
}


/**@type {MuiXDialog} */
const Dialog = styled(MuiXDialog)`
    .MuiDialogTitle-root {
        display: flex;
        align-items: center;
    }
    .MuiDialogContent-root {
        display: grid;
        /* justify-content: space-between;
        row-gap: 2rem;
        column-gap: 1rem; */
        row-gap: 1rem;
        justify-content: stretch;
        align-content: flex-start;
        .MuiFormControl-root:not(.MuiTextField-root) {
            display: grid;
            grid-template-columns: 1fr 1fr;
            justify-content: space-between;
            align-items: center;
        }
        .MuiCollapse-wrapperInner {
            display: grid;
            align-items: center;
            gap: 1.6rem;
        }
        .MuiFormControlLabel-root {
            margin: 0;
            justify-self: flex-start;
        }
    }

    ${({ theme }) => theme.breakpoints.down('sm')}{
        .MuiDialogContent-root {
            .MuiFormControl-root:not(.MuiTextField-root) {
                grid-template-columns: 1fr;
            }
        }
    }
`;


ReaderSettings.propTypes = {
    open: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    readerSettings: PropTypes.shape({
        displayMode: PropTypes.string,
        imageSize: PropTypes.string,
        readingDir: PropTypes.string,
        arrowScrollSize: PropTypes.number,
        preloadPages: PropTypes.number,
    }),
}

export default ReaderSettings;