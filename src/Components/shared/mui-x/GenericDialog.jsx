import { Button, DialogActions, DialogContent, DialogTitle, useMediaQuery, Fade, Slide, useTheme, IconButton } from '@material-ui/core';
import MuiDialog from '@material-ui/core/Dialog';
import PropTypes from 'prop-types';
import React from 'react';
import CloseIcon from '@material-ui/icons/Close';
import styled from 'styled-components';

// TODO showCloseButton, 
//      closeIconButtonProps = {anchorPos(v|h), transfOrig(v|h)}

/**
 * 
 * @param {import('@material-ui/core').DialogProps} props 
 */
function GenericDialog(props) {
    const {
        title, children, wrapForm, onSave, hideCancelButton, cancelButtonLabel,
        actionProps, contentProps, titleProps, hideDialogActions,
        hideDialogTitle, hideSaveButton, breakpoint, saveButtonLabel,
        showCloseButton, onClose, disableBackdropClick,
        saveButtonLabel: sbl, ...otherProps
    } = props;

    const theme = useTheme();
    const query = /px/.test(breakpoint) ? `(max-width:${breakpoint})` :
        `(max-width:${theme.breakpoints.values[breakpoint]}px)`;
    let fullScreen = useMediaQuery(query);

    fullScreen = props.fullScreen || (!!breakpoint && fullScreen);
    const formId = props.formId || 'dialog-form';

    const setTitleProps = Object.assign({}, { disableTypography: typeof title !== 'string' }, props.titleProps)

    function handleClose(ev, reason) {
        if(disableBackdropClick && reason === 'backdropClick') {
            return;
        }
        props.onClose?.(ev, reason);
    }
    
    return (
        <Dialog
            maxWidth='md' fullScreen={fullScreen}
            TransitionComponent={fullScreen ? Slide : Fade}
            TransitionProps={{ direction: 'up' }}
            onClose={handleClose} {...otherProps}
        >
            {!hideDialogTitle &&
                <DialogTitle {...setTitleProps} >
                    {title}
                </DialogTitle>
            }
            {showCloseButton &&
                <CloseButton onClick={e => props.onClose()} >
                    <CloseIcon />
                </CloseButton>
            }
            <DialogContent dividers {...contentProps} >
                {wrapForm ?
                    <form
                        id={formId}
                        onKeyDown={e => {
                            const form = new FormData(e.target.form);
                            const hasManyFields = Array.from(form.entries()).length > 1;
                            if (e.key === 'Enter') {
                                if (e.target.type === 'textarea') {
                                    if (e.ctrlKey) {
                                        e.preventDefault();
                                        onSave && onSave(e);
                                    }
                                } else if (hasManyFields && !e.ctrlKey) {
                                    e.preventDefault();
                                }
                            }
                        }}
                        onSubmit={e => {
                            e.preventDefault();
                            onSave && onSave(e);
                        }}
                    >
                        {children}
                    </form> :
                    children
                }
            </DialogContent>
            {!hideDialogActions &&
                <DialogActions {...actionProps} >
                    {!hideCancelButton &&
                        <Button
                            type='button' onClick={props.onClose}
                        >
                            {cancelButtonLabel || 'Cancel'}
                        </Button>
                    }
                    {!hideSaveButton &&
                        <Button
                            variant='contained' color='primary' disableElevation
                            type='submit' form={formId}
                            onClick={e => {
                                if (!wrapForm) {
                                    e.preventDefault();
                                    onSave && onSave(e);
                                }
                            }}
                        >
                            {saveButtonLabel || 'Save'}
                        </Button>
                    }
                </DialogActions>
            }
        </Dialog>
    )
}

const Dialog = styled(MuiDialog)`
    .MuiDialogContent-root {
        overflow-y: auto;
    }
`;

const CloseButton = styled(IconButton)`
    &.MuiIconButton-root {
        position: absolute;
        top: 0;
        right: 0;
    }
`;

GenericDialog.propTypes = {
    /** Called on cancel button onClick */
    onClose: PropTypes.func.isRequired,
    /** Called onSumbit (if wrapForm) or save button onClick */
    onSave: PropTypes.func,
    /** Rendered in the DialogTitle component */
    title: PropTypes.node.isRequired,
    /** Wraps the dialog children in a form element */
    wrapForm: PropTypes.bool,
    /** Label for the save button */
    saveButtonLabel: PropTypes.node,
    /** Label for the save button */
    cancelButtonLabel: PropTypes.node,
    /** Prevents rendering of the cancel button */
    hideSaveButton: PropTypes.bool,
    /** Prevents rendering of the cancel button */
    hideCancelButton: PropTypes.bool,
    /** Props for the DialogAction Component */
    actionProps: PropTypes.object,
    /** Props for the DialogContent Component */
    contentProps: PropTypes.object,
    /** Props for the DialogTitle Component */
    titleProps: PropTypes.object,
    /** Prevents rendering of the DialogTitle component */
    hideDialogTitle: PropTypes.bool,
    /** Prevents rendering of the DialogActions component */
    hideDialogActions: PropTypes.bool,
    /** px value or theme breakpoints key at which dialog becomes full screen */
    breakpoint: PropTypes.string,
    /** id to be given to the containing form element */
    formId: PropTypes.string,
    /** Show close IconButton in top-right corner */
    showCloseButton: PropTypes.bool,
}

export default GenericDialog;
