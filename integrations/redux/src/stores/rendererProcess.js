/**
 * 
 */
import {configureStore} from '@reduxjs/toolkit';
import {downstreamReducer} from '../reducers';
import {downstreamMiddleware} from '../middleware/downstream';
import {downstreamGetListWithInfo, downstreamCreate, downstreamGetOfflineLink} from './../actions/downstream';
import thunk from 'redux-thunk';


//
const initialState = {
    'downstream': {
        'MAIN_PROCESS_INIT': true
    }
};

export const downstreamStore = configureStore({
    reducer: downstreamReducer,
    initialState,
    middleware: [thunk, downstreamMiddleware]
});

export const defaultState = {
    streams: [
        {
            'id': '000000',
            'url': 'https://demo.cf.castlabs.com/media/TOS/abr/Manifest_clean_sizes.mpd',
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
