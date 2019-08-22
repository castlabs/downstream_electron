/**
 * 
 */
import { combineReducers } from 'redux';
import downstream from './downstream';
import react from './react';

/**
 * 
 */
export const reactReducer = combineReducers({
    react
});

/**
 * 
 */
export const downstreamReducer = combineReducers({
    downstream
});
