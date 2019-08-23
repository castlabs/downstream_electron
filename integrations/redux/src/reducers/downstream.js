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
        state = createIfNotExist(state, action).filter(stream => {
            return stream.id;
        });
    }

    switch (action.type) {
        case 'DOWNSTREAM_CREATE':
            if (action.result || (action.error && action.error.code === 22)) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        url: action.url,
                        created: true,
                        protections: (action.result ? action.result.protections : stream.protections),
                        video: (action.result ? action.result.video : stream.video),
                        audio: (action.result ? action.result.audio : stream.audio),
                        text: (action.result ? action.result.text : stream.text),
                        lastError: ''
                    } : stream)
            } else if (action.error) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        url: action.url,
                        created: false,
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
            if (action.result) {
                return action.result.map(download => {
                    return {
                        id: download
                    };
                });
            } else if (action.error) {
                return state.error;
            }
            break;

        case 'DOWNSTREAM_GET_LIST_WITH_INFO':
            if (action.result) {
                let newState = state.slice();
                action.result.forEach(download => {
                    newState = newState.map(stream =>
                        stream.id === download.manifestInfo.id ? {
                            ...stream,
                            url: download.manifest.url,
                            video: download.manifestInfo.video,
                            audio: download.manifestInfo.audio,
                            text: download.manifestInfo.text,
                            protections: download.manifestInfo.protections,
                            persistent: download.manifestInfo.persistent,
                            created: true,
                            downloaded: (download.status === 'FINISHED' ? true : false),
                            lastError: ''
                        } : stream);
                });
                return newState;
            } else if (action.error) {
                return state.map(stream => {
                    return {
                        ...stream,
                        lastError: action.error
                    };
                });
            }
            break;

        case 'DOWNSTREAM_GET_OFFLINE_LINK':
            if (action.result) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        offlineLink: action.result.offlineLink,
                        persistent: action.result.persistent,
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

        case 'DOWNSTREAM_INFO':
            if (action.result) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        url: action.result.manifest.url,
                        video: action.result.manifestInfo.video,
                        audio: action.result.manifestInfo.audio,
                        text: action.result.manifestInfo.text,
                        protections: action.result.manifestInfo.protections,
                        persistent: action.result.manifestInfo.persistent,
                        created: true,
                        downloading: false,
                        downloaded: (action.result.status === 'FINISHED' ? true : false),
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

        case 'DOWNSTREAM_REMOVE':
            if (!action.error) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        created: false,
                        downloading: false,
                        downloaded: false,
                        lastError: ''
                    } : stream)
            }
            break;

        case 'DOWNSTREAM_REMOVE_ALL':
            return state.filter(stream => {
                return !stream.id;
            });

        case 'DOWNSTREAM_REMOVE_ALL_UNFINISHED':
            return state.filter(stream => {
                return !stream.id;
            });

        case 'DOWNSTREAM_REMOVE_PERSISTENT':
            if (action.result) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        persistentConfig: '',
                        sessionId: '',
                        lastError: ''
                    } : stream)
            } else if (action.error) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        persistentConfig: '',
                        lastError: action.error
                    } : stream)
            }
            break;

        case 'DOWNSTREAM_RESUME':
            if (!action.error) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        downloading: true,
                        stopped: false,
                        lastError: ''
                    } : stream)
            }
            break;

        case 'DOWNSTREAM_SAVE_DATA':
            if (action.result) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        data: action.result.data,
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

        case 'DOWNSTREAM_SAVE_PERSISTENT':
            if (action.result) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        persistent: action.result.persistent,
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

        case 'DOWNSTREAM_START':
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
            if (!action.result) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        downloading: false,
                        stopped: true,
                        lastError: ''
                    } : stream)
            }
            break;

        case 'DOWNSTREAM_STOP_ALL':
            if (!action.error) {
                return state.map(stream => {
                    return {
                        ...stream,
                        downloading: false,
                        stopped: true,
                        lastError: ''
                    }
                });
            }
            break;

        case 'DOWNSTREAM_SUBSCRIBE':
            if (action.result) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        subscribed: true,
                        lastError: ''
                    } : stream)
            } else if (action.error) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        subscribed: false,
                        lastError: action.error
                    } : stream)
            }
            break;

        case 'DOWNSTREAM_DOWNLOAD_PROGRESS':
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
            if (action.result) {
                return state.map(stream =>
                    stream.id === action.id ? {
                        ...stream,
                        subscribed: false,
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

        case 'DOWNSTREAM_UPDATE_DOWNLOAD_FOLDER':
            break;

        default:
            return state;
    }

    return state;
}

export default downstream
