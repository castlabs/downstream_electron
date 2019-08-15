import React from 'react';
import PropTypes from 'prop-types';
import Stream from './Stream';
import { connect } from 'react-redux';
import { downloadStream } from './../actions/react';

const StreamList = ({ streams, download }) => (
  <div>
    <ul>
      {streams.map(stream => (
        <Stream key={stream.id} {...stream} onClick={() => download(stream.id)} text={stream.url} />
      ))}
    </ul>
    <button>Remove All</button>
  </div>
)

StreamList.propTypes = {
  streams: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      completed: PropTypes.bool.isRequired,
      text: PropTypes.string.isRequired
    }).isRequired
  ).isRequired,
  download: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  streams: [
    {
      'id': 0,
      'url': 'http://demo.unified-streaming.com/video/ateam/ateam.ism/ateam.mpd',
      'type': 'DASH'
    },
    {
      'id': 1,
      'url': 'http://demo.unified-streaming.com/video/ateam/ateam.ism/ateam.mpd',
      'type': 'DASH'
    },
    {
      'id': 2,
      'url': 'http://playready.directtaps.net/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/Manifest',
      'type': 'SmoothStreaming'
    },
    {
      'id': 3,
      'url': 'http://playready.directtaps.net/smoothstreaming/SSWSS720H264PR/SuperSpeedway_720.ism/Manifest',
      'type': 'SmoothStreaming'
    }
  ]
})

const mapDispatchToProps = dispatch => ({
  download: id => dispatch(downloadStream(id))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StreamList)
