/**
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
    }

    switch (action.type) {
        case 'DOWNSTREAM_CREATE':
            state = createIfNotExist(state, action);
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
            state = createIfNotExist(state, action);
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
            state = createIfNotExist(state, action);
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
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ]

        case 'DOWNSTREAM_GET_LIST_WITH_INFO':
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ]

        case 'DOWNSTREAM_GET_OFFLINE_LINK':
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ]

        case 'DOWNSTREAM_INFO':
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ]

        case 'DOWNSTREAM_REMOVE':
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ]

        case 'DOWNSTREAM_REMOVE_ALL':
            return [];

        case 'DOWNSTREAM_REMOVE_ALL_UNFINISHED':
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ]

        case 'DOWNSTREAM_REMOVE_PERSISTENT':
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ]

        case 'DOWNSTREAM_RESUME':
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ]

        case 'DOWNSTREAM_SAVE_DATA':
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ]

        case 'DOWNSTREAM_SAVE_PERSISTENT':
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ]

        case 'DOWNSTREAM_START':
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ]

        case 'DOWNSTREAM_STOP':
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ]

        case 'DOWNSTREAM_STOP_ALL':
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ]

        case 'DOWNSTREAM_SUBSCRIBE':
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ]

        case 'DOWNSTREAM_UNSUBSCRIBE':
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ]

        case 'DOWNSTREAM_UPDATE_DOWNLOAD_FOLDER':
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ]

        default:
            return state
    }

    return state;
}

export default downstream
