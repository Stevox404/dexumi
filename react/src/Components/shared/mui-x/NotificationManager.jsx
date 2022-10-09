import { IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function NotificationManager() {
    const { closeSnackbar, enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();
    const notifications = useSelector(({ notifications }) => notifications || []);

    /** @param {string} key - notification identifier */
    const removeNotification = (key) => {
        notifications.some(ntf => {
            if(ntf.key === key){
                if (Date.now() - ntf.addTime < 1000) {
                    window.setTimeout(() => {
                        closeSnackbar(key);
                    }, 1000);
                } else {
                    closeSnackbar(key);
                }
                return true;
            }
        });
        
        return dispatch({
            type: 'notification/removed',
            payload: key
        });
    }

    const getNotificationActions = ntf => {
        const closeIconBtn = key => (
            <IconButton onClick={e => {
                dispatch(removeNotification(ntf.key))
            }} >
                <Close color='action' />
            </IconButton>
        );

        if (ntf.action === undefined && ntf.showDismiss !== false) {
            return closeIconBtn();
        } else {
            const actions = [ntf.action];
            if (ntf.showDismiss) {
                actions.push(closeIconBtn());
            }
            return actions;
        }
    }


    useEffect(() => {
        const count = 3;
        let i = -1;
        while (++i < count) {
            const ntf = notifications[i];
            if (!ntf) break;
            if (ntf.dismissed) {
                removeNotification(ntf.key);
                continue;
            }
            enqueueSnackbar(ntf.message, {
                variant: ntf.variant,
                persist: ntf.persist,
                key: ntf.key,
                autoHideDuration: ntf.autoHideDuration,
                preventDuplicate: true,
                onExited: (e, key) => removeNotification(key),
                onClose: (e, reason, key) => {
                    if (ntf.onClose) {
                        ntf.onClose(e, reason, key);
                    }
                },
                action: getNotificationActions(ntf),
                className: 'notification-snackbar',
            });
        }
    }, [notifications]);

    return (
        null
    )
}


export default NotificationManager;