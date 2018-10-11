import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { dismissMessage } from '../actions/messages';
import styles from '../css/components/message';

const cx = classNames.bind(styles);

const Message = ({message, dismissMessage}) => (
  <div
    className={cx('error', 
      {show: message && message.text !== ''}
    )}
    onClick={dismissMessage}>
    <div className={cx('header')}>
      {message.type.toUpperCase()}
    </div >
    <div className={cx('text')}>
      {message.text}
    </div >
  </div>
);

Message.propTypes = {
  message: PropTypes.object,
  dismissMessage: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return { message: state.message };
}

export default connect(mapStateToProps, { dismissMessage })(Message);
