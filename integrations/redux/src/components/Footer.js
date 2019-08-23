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
const Footer = ({ removeAll, visible }) => (
  <footer className="App-footer">
    <div>
      {visible &&
        <button className="App-button-bottom" onClick={() => removeAll()}>Remove All Downloaded</button>
      }
      <span>castLabs @ 2019</span>
    </div>
  </footer>
)

/**
 * 
 */
Footer.propTypes = {
  removeAll: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired
};

/**
 * 
 * @param {*} state 
 */
const mapStateToProps = state => {
  let visible = false;
  if (state.downstream && state.downstream.length > 0) {
    visible = true;
  }

  return ({
    visible: visible
  });
}


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
  mapStateToProps,
  mapDispatchToProps
)(Footer);
