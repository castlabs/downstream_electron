/**
 * 
 */
import { createStore, applyMiddleware, compose } from 'redux';
import { downstreamReducer } from '../reducers';
import { downstreamMiddleware } from '../middleware/downstream';
import { forwardToMain, replayActionRenderer, getInitialStateRenderer } from 'electron-redux';
import { downstreamGetListWithInfo } from './../actions/downstream';
import thunk from 'redux-thunk';


//
const initialState = getInitialStateRenderer();
//
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

/**
 * 
 */
export const downstreamStore = createStore(
    downstreamReducer, 
    initialState,
    composeEnhancers(
        applyMiddleware(
            forwardToMain,
            thunk,
            downstreamMiddleware
        )
    )
);

//
replayActionRenderer(downstreamStore);
// get stored movies just after init
downstreamStore.dispatch(downstreamGetListWithInfo());
