import React from 'react'
import PropTypes from 'prop-types'
import Stream from './Stream'

const StreamList = ({ streams, download }) => (
  <ul>
    {streams.map(stream => (
      <Stream key={stream.id} {...stream} onClick={() => download(stream.id)} />
    ))}
  </ul>
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

export default StreamList
