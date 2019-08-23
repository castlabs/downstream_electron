/**
 * 
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { playStream, playOfflineStream } from './../actions/react';
import { downstreamCreate, downstreamStart, downstreamRemove, downstreamSubscribe, downstreamDownloadProgress, downstreamDownloadFinished, downstreamInfo, downstreamGetOfflineLink, downstreamStop, downstreamResume, downstreamUnsubscribe } from './../actions/downstream';


/**
 * 
 * @param {*} param0 
 */
const Stream = ({ stream, create, download, stop, resume, play, playOffline, remove, info }) => (
  <li className="App-list">
    <div className={stream.downloaded ? 'App-url-downloaded' : 'App-url'}>
      {stream.downloading &&
        <div className="progress" style={{ width: `${stream.stats.progressPercentage}` }}></div>
      }
      {stream.url}
    </div>

    <div>
      {(!stream.created && !stream.downloaded && !stream.downloading) &&
        <button className="App-button" onClick={() => create(stream.id, stream.url)}>Create</button>
      }

      {(stream.created && !stream.downloaded && !stream.downloading && !stream.stopped) &&
        <button className="App-button" onClick={() => download(stream.id, stream.video, stream.audio, stream.text)}>Download</button>
      }

      <button className="App-button" onClick={() => play(stream.url)}>Play</button>

      {(stream.created && stream.downloaded && !stream.downloading) &&
        <button className="App-button" onClick={() => playOffline(stream.offlineLink)}>Play Offline</button>
      }

      {(stream.created && stream.downloaded && !stream.downloading) &&
        <button className="App-button" onClick={() => remove(stream.id)}>Remove</button>
      }

      {stream.downloading &&
        <button className="App-button" onClick={() => stop(stream.id)}>Stop</button>
      }

      {stream.stopped &&
        <button className="App-button" onClick={() => resume(stream.id)}>Resume</button>
      }

      {stream.created &&
        <button className="App-button" onClick={() => info(stream.id)}>Info</button>
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
  stop: PropTypes.func.isRequired,
  resume: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  info: PropTypes.func.isRequired
};

/**
 * 
 * @param {*} state 
 */
const mapStateToProps = state => {
  return state;
};

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

    dispatch(
      downstreamStart(id, representations)
    );

    dispatch(
      downstreamSubscribe(id, 1000, (error, stats) => {
        dispatch(
          // NOTE: this does not have to be done with Redux action
          downstreamDownloadProgress(id, error, stats)
        );
      }, (error, info) => {
        if (!error) {
          dispatch(
            downstreamGetOfflineLink(id)
          );
        }
        dispatch(
          downstreamDownloadFinished(id, error, info)
        );
      })
    );
  },
  play: url => dispatch(playStream(url)),
  playOffline: url => dispatch(playOfflineStream(url)),
  stop: id => {
    dispatch(downstreamUnsubscribe(id));
    dispatch(downstreamStop(id));
  },
  resume: id => {
    dispatch(
      downstreamSubscribe(id, 1000, (error, stats) => {
        dispatch(
          // NOTE: this does not have to be done with Redux action
          downstreamDownloadProgress(id, error, stats)
        );
      }, (error, info) => {
        if (!error) {
          dispatch(
            downstreamGetOfflineLink(id)
          );
        }
        dispatch(
          downstreamDownloadFinished(id, error, info)
        );
      })
    );

    dispatch(downstreamResume(id));
  },
  remove: id => dispatch(downstreamRemove(id)),
  info: id => dispatch(downstreamInfo(id))
});

/**
 * 
 */
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Stream);
