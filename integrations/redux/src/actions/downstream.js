/**
 * 
 * DOWNstream for Electron - Redux Actions
 * 
 */

/**
 * 
 * @param {*} id 
 * @param {*} url 
 */
export const downstreamCreate = (id, url) => ({
    type: 'DOWNSTREAM_CREATE',
    id: id,
    url: url
});

/**
 * 
 * @param {*} id 
 * @param {*} persistentConfig 
 */
export const downstreamCreatePersistent = (id, persistentConfig) => ({
    type: 'DOWNSTREAM_CREATE_PERSISTENT',
    id: id,
    persistentConfig: persistentConfig
});

/**
 * 
 * @param {*} id 
 */
export const downstreamGetFolderInfo = id => ({
    type: 'DOWNSTREAM_GET_FOLDER_INFO',
    id
});

/**
 * 
 */
export const downstreamGetList = () => ({
    type: 'DOWNSTREAM_GET_LIST'
});

/**
 * 
 */
export const downstreamGetListWithInfo = () => ({
    type: 'DOWNSTREAM_GET_LIST_WITH_INFO'
});

/**
 * 
 * @param {*} id 
 */
export const downstreamGetOfflineLink = id => ({
    type: 'DOWNSTREAM_GET_OFFLINE_LINK',
    id
});

/**
 * 
 * @param {*} id 
 */
export const downstreamInfo = id => ({
    type: 'DOWNSTREAM_INFO',
    id
});

/**
 * 
 * @param {*} id 
 */
export const downstreamRemove = id => ({
    type: 'DOWNSTREAM_REMOVE',
    id
});

/**
 * 
 */
export const downstreamRemoveAll = () => ({
    type: 'DOWNSTREAM_REMOVE_ALL'
});

/**
 * 
 */
export const downstreamRemoveAllUnfinished = () => ({
    type: 'DOWNSTREAM_REMOVE_ALL_UNFINISHED'
});

/**
 * 
 * @param {*} id 
 */
export const downstreamRemovePersistent = id => ({
    type: 'DOWNSTREAM_REMOVE_PERSISTENT',
    id
});

/**
 * 
 * @param {*} id 
 */
export const downstreamResume = id => ({
    type: 'DOWNSTREAM_RESUME',
    id
});

/**
 * 
 * @param {*} id 
 * @param {*} data 
 */
export const downstreamSaveData = (id, data) => ({
    type: 'DOWNSTREAM_SAVE_DATA',
    id: id,
    data: data
});

/**
 * 
 * @param {*} id 
 * @param {*} persistent 
 */
export const downstreamSavePersistent = (id, persistent) => ({
    type: 'DOWNSTREAM_SAVE_PERSISTENT',
    id: id,
    persistent: persistent
});

/**
 * 
 * @param {*} id 
 * @param {*} representations 
 * @param {*} customFolder 
 */
export const downstreamStart = (id, representations, customFolder) => ({
    type: 'DOWNSTREAM_START',
    id: id,
    representations: representations,
    customFolder: customFolder
});

/**
 * 
 * @param {*} id 
 */
export const downstreamStop = id => ({
    type: 'DOWNSTREAM_STOP',
    id
});

/**
 * 
 */
export const downstreamStopAll = () => ({
    type: 'DOWNSTREAM_STOP_ALL'
});

/**
 * 
 * @param {*} id 
 * @param {*} timeout 
 * @param {*} onProgress 
 * @param {*} onFinish 
 */
export const downstreamSubscribe = (id, timeout, onProgress, onFinish) => ({
    type: 'DOWNSTREAM_SUBSCRIBE',
    id: id,
    timeout: timeout,
    onProgress: onProgress,
    onFinish: onFinish
});

/**
 * 
 * @param {*} id 
 * @param {*} error 
 * @param {*} stats 
 */
export const downstreamDownloadProgress = (id, error, stats) => ({
    type: 'DOWNSTREAM_DOWNLOAD_PROGRESS',
    id: id,
    error: error,
    stats: stats
});

/**
 * 
 * @param {*} id 
 * @param {*} error 
 * @param {*} info 
 */
export const downstreamDownloadFinished = (id, error, info) => ({
    type: 'DOWNSTREAM_DOWNLOAD_FINISHED',
    id: id,
    error: error,
    info: info
});

/**
 * 
 * @param {*} id 
 */
export const downstreamUnsubscribe = id => ({
    type: 'DOWNSTREAM_UNSUBSCRIBE',
    id
});

/**
 * 
 * @param {*} id 
 * @param {*} path 
 */
export const downstreamUpdateDownloadFolder = (id, path) => ({
    type: 'UPDATE_DOWNLOAD_FOLDER',
    id: id,
    path: path
});
