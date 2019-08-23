/**
 * 
 */
import React from 'react';
import PropTypes from 'prop-types';
import Stream from './Stream';
import { connect } from 'react-redux';
import { defaultState } from '../stores/rendererProcess';

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
  let streams = concatAndRemoveDuplicateObjects(defaultState.streams.slice(), state.downstream);

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
  if (updatedState.length === 0) {
    defaultState.forEach(stream => {
      stream.created = false;
      stream.downloaded = false;
      stream.downloading = false;
    });
    return defaultState;
  }

  let state = defaultState.map(stream => {
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

  return state.map((stream => {
    if (typeof stream.created === 'undefined') {
      stream.created = false;
    }

    if (typeof stream.downloading === 'undefined') {
      stream.downloading = false;
    }

    if (typeof stream.downloaded === 'undefined') {
      stream.downloaded = false;
    }

    return stream;
  }));
}

/**
 * 
 */
export default connect(
  mapStateToProps
)(StreamList);
