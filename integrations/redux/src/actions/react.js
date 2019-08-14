/**
 * 
 * 
 */

export const listStreams = id => ({
    type: 'LIST_STREAMS',
    id: id
});

export const listDownloadedStreams = id => ({
    type: 'LIST_DOWNLOADED_STREAMS',
    id: id
});

export const selectQuality = (id, quality) => ({
    type: 'SELECT_QUALITY',
    id: id,
    quality: quality
});

export const downloadStream = (id, quality) => ({
    type: 'DOWNLOAD_STREAM',
    id: id,
    quality: quality
});

export const showStreamDetails = id => ({
    type: 'SHOW_STREAM_DETIALS',
    id: id
});

export const playStream = id => ({
    type: 'PLAY_STREAM',
    id: id
});
