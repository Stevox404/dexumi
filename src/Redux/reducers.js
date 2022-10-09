export function pending(state = [], action) {
    switch (action.type) {
        case 'pending/start': {
            return [...state, action.payload]
        }
        case 'pending/end': {
            const pending = [...state];
            const idx = pending.findIndex(el => el == action.payload)
            if(idx>-1) pending.splice(idx, 1);
            return pending;
        }
        default: return state;
    }
}

export function user(state = null, action) {
    switch (action.type) {
        case 'user/setUser': {
            const user = action.payload;
            if (user) {
                return user;
            }
            return state;
        }
        case 'user/clearUser': {
            return null;
        }
        default: return state;
    }
}

export function language(state = 'en', action) {
    switch (action.type) {
        case 'language/set': {
            return action.payload;
        }
        default: return state;
    }
}


const defaultSettings = {};
export function settings(state = defaultSettings, action){
    switch (action.type) {
        case 'settings/change': {
            const settings = {...state};
            for(let [key, val] of Object.entries(action.payload)){
                settings[key] = val;
            }
            return settings;
        }
        case 'settings/default': {
            return defaultSettings;
        }
        default: return state;
    }
}



export function notifications(state = [], action) {
    switch (action.type) {
        case 'notification/added': {
            const idx = action.payload.group ?
                state.findIndex(n => n.group === action.payload.group) : -1;
            if (idx > -1) state[idx].dismissed = true;
            return [...state, action.payload];
        }
        case 'notification/edited': {
            const idx = action.payload.key ?
                state.findIndex(n => n.key === action.payload.key) : -1;
            if (idx > -1) {
                state[idx].dismissed = true;
            }

            const jdx = action.payload.group ?
                state.findIndex(n => n.group === action.payload.group) : -1;
            if (jdx > -1) state[jdx].dismissed = true;

            const notif = action.payload;
            notif.key = notif.newKey;
            delete notif.newKey;
            return [...state, { ...notif }];
        }
        case 'notification/dismissed': {
            const idx = state.findIndex(n => n.key === action.payload);
            if (idx > -1) {
                state[idx].dismissed = true;
            }
            return [...state];
        }
        case 'notification/dismissedGroup': {
            const newState = state.map(n => {
                if (n.group === action.payload) {
                    n.dismissed = true;
                }
                return n;
            });
            return newState;
        }
        case 'notification/removed': {
            const idx = state.findIndex(n => n.key === action.payload);
            if (idx > -1) {
                state.splice(idx, 1);
            }
            return [...state];
        }
        default: return state;
    }
}

export function firstRender(state = true, action) {
    if (state && action.type === 'pending/end') {
        return false;
    }
    return state;
}