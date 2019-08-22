/**
 * 
 */
const redux = require('redux');
const electronRedux = require('electron-redux');

//
const initialState = {
    'downstream': {
        'MAIN_PROCESS_INIT': true
    }
};

/**
 * 
 */
const downstreamStore = redux.createStore(
    function(state = [], action) {
        return state;
    },
    initialState,
    redux.applyMiddleware(
        electronRedux.triggerAlias,
        electronRedux.forwardToRenderer
    )
);

//
electronRedux.replayActionMain(downstreamStore);
