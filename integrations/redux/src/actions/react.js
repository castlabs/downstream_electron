/**
 * 
 * Basic Actions for React Componenets
 * 
 */

export const playStream = id => ({
    type: 'PLAY_STREAM',
    id: id
});

export const playOfflineStream = id => ({
    type: 'PLAY_OFFLINE_STREAM',
    id: id
});

export const Filters = {
    FILTER_A: 'FILTER_A',
    FILTER_B: 'FILTER_B',
    FILTER_C: 'FILTER_C'
};
