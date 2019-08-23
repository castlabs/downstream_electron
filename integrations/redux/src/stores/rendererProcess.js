/**
 * 
 */
import { createStore, applyMiddleware, compose } from 'redux';
import { downstreamReducer } from '../reducers';
import { downstreamMiddleware } from '../middleware/downstream';
import { forwardToMain, replayActionRenderer, getInitialStateRenderer } from 'electron-redux';
import { downstreamGetListWithInfo, downstreamCreate, downstreamGetOfflineLink } from './../actions/downstream';
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

export const defaultState = {
    streams: [
        {
            'id': '000000',
            'url': 'http://demo.unified-streaming.com/video/ateam/ateam.ism/ateam.mpd',
            'type': 'DASH',
            'created': false,
            'downloading': false,
            'downloaded': false
        },
        {
            'id': '000001',
            'url': 'http://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd',
            'type': 'DASH',
            'created': false,
            'downloading': false,
            'downloaded': false
        },
        {
            'id': '000002',
            'url': 'http://playready.directtaps.net/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/Manifest',
            'type': 'SmoothStreaming',
            'created': false,
            'downloading': false,
            'downloaded': false
        }
    ]
};

// get stored movies just after init
downstreamStore.dispatch(downstreamGetListWithInfo());

// NOTE: initially prepare all stream for download
defaultState.streams.forEach(stream => {
    downstreamStore.dispatch(downstreamCreate(stream.id, stream.url));
});

// NOTE: initially get offline links if available
defaultState.streams.forEach(stream => {
    downstreamStore.dispatch(downstreamGetOfflineLink(stream.id));
});
