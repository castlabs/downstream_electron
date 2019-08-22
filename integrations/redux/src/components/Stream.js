/**
 * 
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { playStream, playOfflineStream } from './../actions/react';
import { downstreamCreate, downstreamCreatePersistent, downstreamGetFolderInfo, downstreamGetList, downstreamStart, downstreamRemove } from './../actions/downstream';


/**
 * 
 * @param {*} param0 
 */
const Stream = ({ stream, create, download, play, playOffline, remove }) => (
  <li className="App-list">
    <div className="App-url">{stream.url}</div>

    <div>
      {(!stream.created && !stream.downloaded) &&
        <button className="App-button" onClick={() => create(stream.id, stream.url)}>Create</button>
      }

      {(stream.created && !stream.downloaded) &&
        <button className="App-button" onClick={() => download(stream.id, stream.video, stream.audio, stream.text)}>Download</button>
      }

      <button className="App-button" onClick={() => play(stream.url)}>Play</button>

      {(stream.created && stream.downloaded) &&
        <button className="App-button" onClick={() => playOffline(stream.url)}>Play Offline</button>
      }

      {(stream.created && stream.downloaded) &&
        <button className="App-button" onClick={() => remove(stream.id)}>Remove</button>
      }
    </div>
  </li>
);

/**
 * 
 */
Stream.propTypes = {
  stream: PropTypes.object.isRequired,
  create: PropTypes.func.isRequired,
  download: PropTypes.func.isRequired,
  play: PropTypes.func.isRequired,
  playOffline: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired
};

/**
 * 
 * @param {*} state 
 */
const mapStateToProps = state => ({
  state: state
});

/**
 * 
 * @param {*} dispatch 
 */
const mapDispatchToProps = dispatch => ({
  create: (id, url) => {
    dispatch(
      downstreamCreate(id, url)
    );
  },
  download: (id, video, audio, text) => {
    let representations = {
      video: video.map(v => v.id),
      audio: audio.map(a => a.id),
      text: text.map(t => t.id)
    };

    console.log(representations);

    dispatch(
      downstreamStart(id, representations)
    );

    /*
    dispatch(
      downstreamCreatePersistent(id, {
        pssh: id
      })
    );
    */

    /*
    dispatch(
      downstreamGetFolderInfo(id)
    );
    */

    /*
    dispatch(
      downstreamGetList()
    );
    */
  },
  play: url => dispatch(playStream(url)),
  playOffline: url => dispatch(playOfflineStream(url)),
  remove: id => dispatch(downstreamRemove(id))
});

/**
 * 
 */
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Stream);
