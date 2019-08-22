/**
 * 
 */
import React from 'react';
import PropTypes from 'prop-types';
import Stream from './Stream';
import { connect } from 'react-redux';

/**
 * 
 * @param {*} param0 
 */
const StreamList = ({ streams }) => (
  <div>
    <p className="App-stream-header">Stream List:</p>
    <ul>
      {streams.map(stream => (
        <Stream key={stream.id} stream={stream} />
      ))}
    </ul>
  </div>
)

/**
 * 
 */
StreamList.propTypes = {
  streams: PropTypes.arrayOf(
    PropTypes.object.isRequired
  ).isRequired
}

/**
 * 
 * @param {*} state 
 */
const mapStateToProps = state => {
  let defaultState = {
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

  let streams = concatAndRemoveDuplicateObjects(defaultState.streams, state.downstream);

  return {
    streams: streams
  };
};

/**
 * 
 * @param {*} defaultState 
 * @param {*} updatedState 
 */
let concatAndRemoveDuplicateObjects = (defaultState, updatedState) => {
  return defaultState.map(stream => {
    let updated = updatedState.filter(u => {
      return stream.id === u.id;
    })[0];

    if (updated === null || typeof updated === 'undefined') {
      return stream;
    }

    Object.keys(updated).forEach(key => {
      stream[key] = (typeof updated[key] === 'undefined' ? stream[key] : updated[key]);
    });

    return stream;
  });
}

/**
 * 
 */
export default connect(
  mapStateToProps
)(StreamList);
