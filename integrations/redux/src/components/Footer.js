/**
 * 
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { downstreamRemoveAll } from './../actions/downstream';

/**
 * 
 */
const Footer = ({ removeAll }) => (
  <footer className="App-footer">
    <div>
      <button className="App-button-bottom" onClick={() => removeAll()}>Remove All Downloaded</button>
      <span>castLabs @ 2019</span>
    </div>
  </footer>
)

/**
 * 
 */
Footer.propTypes = {
  removeAll: PropTypes.func.isRequired
};

/**
 * 
 * @param {*} dispatch 
 */
const mapDispatchToProps = dispatch => ({
  removeAll: () => dispatch(downstreamRemoveAll())
});

/**
 * 
 */
export default connect(
  null,
  mapDispatchToProps
)(Footer);
