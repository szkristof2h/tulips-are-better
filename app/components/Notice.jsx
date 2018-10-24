import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import classNames from 'classnames/bind';
import styles from '../css/components/notice';

const cx = classNames.bind(styles);

export default class Notice extends Component {
  render() {
    return (
      <Fragment>
        <div className={cx('notice', 'green')}>
          As user registration is currently not implemented, you'll be logged in as a sample user.
        </div>
        <div className={cx('notice')}>
          The site is still in its early phases and thus many features aren't working: Conversations, Lists (can't create new ones), Browse, Search, Settings, About and Navigation (doesn't work on mobile and tablet resolutions).
        </div>
      </Fragment>
    );
  }
}