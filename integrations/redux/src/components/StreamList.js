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
  // TODO: read default state also from downstream and merge
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
        'url': 'http://demo.unified-streaming.com/video/ateam/ateam.ism/ateam.mpd',
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
      },
      {
        'id': '000003',
        'url': 'http://playready.directtaps.net/smoothstreaming/SSWSS720H264PR/SuperSpeedway_720.ism/Manifest',
        'type': 'SmoothStreaming',
        'created': false,
        'downloading': false,
        'downloaded': false
      }
    ]
  };

  let streams = concatAndDeDuplicateObjects('id', state.downstream, defaultState.streams);

  return {
    streams: streams
  };
};

/**
 * 
 * @param {*} p 
 * @param  {...any} arrs 
 */
let concatAndDeDuplicateObjects = (p, ...arrs) => [].concat(...arrs).reduce((a, b) => !a.filter(c => b[p] === c[p]).length ? [...a, b] : a, []);

/**
 * 
 */
export default connect(
  mapStateToProps
)(StreamList);
