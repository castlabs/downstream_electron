/**
 * 
 * 
 */

export const create = id => ({
    type: 'CREATE',
    id: id
});

export const createPersistent = id => ({
    type: 'CREATE_PERSISTENT',
    id: id
});

export const getFolderInfo = id => ({
    type: 'GET_FOLDER_INFO',
    id
});

export const getList = id => ({
    type: 'GET_LIST',
    id
});

export const getListWithInfo = id => ({
    type: 'GET_LIST_WITH_INFO',
    id
});

export const getOfflineLink = id => ({
    type: 'GET_OFFLINE_LINK',
    id
});

export const info = id => ({
    type: 'INFO',
    id
});

export const remove = id => ({
    type: 'REMOVE',
    id
});

export const removeAll = id => ({
    type: 'REMOVE_ALL',
    id
});

export const removeAllUnfinished = id => ({
    type: 'REMOVE_ALL_UNFINISHED',
    id
});

export const removePersistent = id => ({
    type: 'REMOVE_PERSISTENT',
    id
});

export const resume = id => ({
    type: 'RESUME',
    id
});

export const saveData = id => ({
    type: 'SAVE_DATA',
    id
});

export const savePersistent = id => ({
    type: 'SAVE_PERSISTENT',
    id
});

export const start = id => ({
    type: 'START',
    id
});

export const stop = id => ({
    type: 'STOP',
    id
});

export const stopAll = id => ({
    type: 'STOP_ALL',
    id
});

export const subscribe = id => ({
    type: 'SUBSCRIBE',
    id
});

export const unsubscribe = id => ({
    type: 'UNSUBSCRIBE',
    id
});

export const updateDownloadFolder = id => ({
    type: 'UPDATE_DOWNLOAD_FOLDER',
    id
});

export const Filters = {
  FILTER_A: 'FILTER_A',
  FILTER_B: 'FILTER_B',
  FILTER_C: 'FILTER_C'
};
