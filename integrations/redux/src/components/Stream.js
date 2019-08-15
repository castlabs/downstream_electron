import React from 'react';
import PropTypes from 'prop-types';

const Stream = ({ onClick, completed, text }) => (
  <li
    onClick={onClick}
    style={{
      textDecoration: completed ? 'line-through' : 'none'
    }}
  >
    {text}
    <button>Download</button>
    <button>Play</button>
    <button>Play Offline</button>
    <button>Remove</button>
  </li>
)

Stream.propTypes = {
  onClick: PropTypes.func.isRequired,
  completed: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired
}

export default Stream;
