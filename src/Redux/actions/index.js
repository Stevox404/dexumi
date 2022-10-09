import { login as mfaLogin, User } from 'mangadex-full-api';
import moment from 'moment';
import { DexCache, hashCode, isOnline } from 'Utils';


export const login = (auth) => {
    return async dispatch => {
        if(!isOnline()) return;
        
        let key;
        try {
            dispatch(beginPending('login'));
            const cache = new DexCache('user_logins', {
                validFor: moment.duration(2, 'weeks')
            });
            const user_logins = (await cache.fetch()) || {};

            if (auth) {
                key = dispatch(addNotification({
                    message: 'Logging in...',
                    persist: true,
                    showDismiss: false
                }));

                await mfaLogin(auth.username, auth.password, 'dexumi_tokens');

                const authCode = hashCode(auth.username + auth.password);
                user_logins[auth.username] = {
                    username: auth.username,
                    code: authCode,
                }
            } else {
                const username = user_logins._lastLogin;
                if(username) {
                    await mfaLogin(username, undefined, 'dexumi_tokens');
                }
            }

            dispatch(dismissNotification(key));
            dispatch(dismissNotificationGroup('login'));

            const user = await User.getLoggedInUser();
            if(!user) return;

            user_logins[user.username] = {
                ...user,
                ...user_logins[user.username]
            }
            user_logins._lastLogin = auth.username;
            cache.data = user_logins;
            await cache.save();
            
            dispatch({
                type: `user/setUser`,
                payload: user
            });
        } catch (err) {
            if(auth){
                dispatch(editNotification({
                    key,
                    message: 'Login failed',
                    persist: true,
                    group: 'login',
                }));
            }
        } finally {
            dispatch(endPending('login'));
        }
    }
}

export const logout = () => {
    return async dispatch => {
        dispatch({
            type: 'user/loggedOut'
        });
    }
}





/**
 * @typedef Notification
 * @type {{
    *  message: string,
    *  group: string,
    *  variant: "default"|"info"|"success"|"error"|"warning",
    *  persist: boolean,
    *  autoHideDuration: number,
    *  action: Node|null,
    *  onClose: Function,
    *  showDismiss: boolean,
    * }}
    */
/**
 * @param {Notification} payload - notification details
 */
export const addNotification = (payload) => {
    return dispatch => {
        const key = Math.random().toString(36).slice(2);
        const addTime = new Date();

        dispatch({
            type: 'notification/added',
            payload: { ...payload, key, addTime }
        });

        return key;
    }
}

/**
 * @param {Notification} payload - notification details
 * @param {string} payload.key - notification identifier
 */
export const editNotification = (payload) => {
    return dispatch => {
        const newKey = Math.random().toString(36).slice(2);
        const addTime = new Date();
        dispatch({
            type: 'notification/edited',
            payload: { ...payload, newKey, addTime }
        });

        return newKey;
    }
}

/**
 * @param {string} key - notification identifier
 */
export const dismissNotification = (key) => {
    return {
        type: 'notification/dismissed',
        payload: key
    }
}

/**
 * @param {string} group - notification group identifier
 */
export const dismissNotificationGroup = (group) => {
    return {
        type: 'notification/dismissedGroup',
        payload: group
    }
}

export const beginPending = (action) => {
    return {
        type: 'pending/start',
        payload: action
    }
}

export const endPending = (action) => {
    return {
        type: 'pending/end',
        payload: action
    }
}