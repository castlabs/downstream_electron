/**
 * 
 * DOWNstream for Electron - Redux Reducers
 * 
 */

/**
 * 
 * @param {*} state 
 * @param {*} action 
 */
function createIfNotExist(state, action) {
    let stream = state.find(s => {
        return s.id === action.id;
    });

    if (typeof stream === 'undefined') {
        state = [
            ...state,
            {
                id: action.id
            }
        ]
    }

    return state;
}

/**
 * 
 * @param {*} state 
 * @param {*} action 
 */
const downstream = (state = [], action) => {
    if (state.MAIN_PROCESS_INIT) {
        state = [];
    } else {
        state = createIfNotExist(state, action);
    }

    switch (action.type) {
        case 'DOWNSTREAM_CREATE':
            if (action.result) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        url: action.url,
                        completed: false,
                        created: true,
                        downloading: false,
                        protections: action.result.protections,
                        video: action.result.video,
                        audio: action.result.audio,
                        text: action.result.text,
                        lastError: ''
                    } : stream)
            } else if (action.error) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        url: action.url,
                        completed: false,
                        created: false,
                        downloading: false,
                        lastError: action.error
                    } : stream)
            }
            break;

        case 'DOWNSTREAM_CREATE_PERSISTENT':
            if (action.result) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        persistentConfig: action.persistentConfig,
                        sessionId: action.result,
                        lastError: ''
                    } : stream)
            } else if (action.error) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        persistentConfig: action.persistentConfig,
                        lastError: action.error
                    } : stream)
            }
            break;

        case 'DOWNSTREAM_GET_FOLDER_INFO':
            if (action.result) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        folder: action.result.folder,
                        size: action.result.size,
                        lastError: ''
                    } : stream)
            } else if (action.error) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        lastError: action.error
                    } : stream)
            }
            break;

        case 'DOWNSTREAM_GET_LIST':
            break;

        case 'DOWNSTREAM_GET_LIST_WITH_INFO':
            break;

        case 'DOWNSTREAM_GET_OFFLINE_LINK':
            break;

        case 'DOWNSTREAM_INFO':
            break;

        case 'DOWNSTREAM_REMOVE':
            break;

        case 'DOWNSTREAM_REMOVE_ALL':
            return [];

        case 'DOWNSTREAM_REMOVE_ALL_UNFINISHED':
            break;

        case 'DOWNSTREAM_REMOVE_PERSISTENT':
            break;

        case 'DOWNSTREAM_RESUME':
            break;

        case 'DOWNSTREAM_SAVE_DATA':
            break;

        case 'DOWNSTREAM_SAVE_PERSISTENT':
            break;

        case 'DOWNSTREAM_START':
            state = createIfNotExist(state, action);
            if (action.result) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        downloading: true,
                        lastError: ''
                    } : stream)
            } else if (action.error) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        downloading: false,
                        lastError: action.error
                    } : stream)
            }
            break;

        case 'DOWNSTREAM_STOP':
            break;

        case 'DOWNSTREAM_STOP_ALL':
            break;

        case 'DOWNSTREAM_SUBSCRIBE':
            break;

        case 'DOWNSTREAM_DOWNLOAD_PROGRESS':
            state = createIfNotExist(state, action);
            if (action.stats) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        downloading: true,
                        stats: action.stats,
                        lastError: ''
                    } : stream)
            } else if (action.error) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        downloading: false,
                        lastError: action.error
                    } : stream)
            }
            break;

        case 'DOWNSTREAM_DOWNLOAD_FINISHED':
            state = createIfNotExist(state, action);
            if (action.info) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        downloading: false,
                        downloaded: true,
                        info: action.info,
                        lastError: ''
                    } : stream)
            } else if (action.error) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        downloading: false,
                        downloaded: false,
                        lastError: action.error
                    } : stream)
            }
            break;

        case 'DOWNSTREAM_UNSUBSCRIBE':
            break;

        case 'DOWNSTREAM_UPDATE_DOWNLOAD_FOLDER':
            break;

        default:
            return state;
    }

    return state;
}

export default downstream
