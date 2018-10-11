import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from '../css/components/navigation';
import Link from '../components/Link';

import home from "../images/home.png";
import search from "../images/search.png";
import add from "../images/add.png";
import book from "../images/works.png";
import works from "../images/edit.png";
import profile from "../images/profile.png";
import notifications from "../images/notifications.png";
import conversations from "../images/conversations.png";
import lists from "../images/lists.png";
import settings from "../images/settings.png";
import about from "../images/about.png";

const cx = classNames.bind(styles);

export default class Main extends Component {
  render() {
    return (
      <div className={cx('main-navigation')}>
        <Link
          className={cx('item')}
          type='navigation'
          action='home'
          data={{}}
          name=''>
          <div className={cx('item-text')}>Home</div>
          <img className={cx('item-icon')} src={home} />
        </Link>
        <Link
          className={cx('item')}
          type='navigation'
          action='add'
          data={{}}
          name=''>
          <div className={cx('item-text')}>Add</div>
          <img className={cx('item-icon')} src={add} />
        </Link>
        <div className={cx('item')}>
          <div className={cx('item-text')}>Search</div>
          <img className={cx('item-icon')} src={search} />
        </div>
        <div className={cx('item')}>
          <div className={cx('item-text')}>Browse</div>
          <img className={cx('item-icon')} src={book} />
        </div>
        <Link
          className={cx('item')}
          type='navigation'
          action='works'
          data={{}}
          name=''>
          <div className={cx('item-text')}>Works</div>
          <img className={cx('item-icon')} src={works} />
        </Link>
        <Link
          className={cx('item')}
          type='navigation'
          action='profile'
          data={{}}
          name=''>
          <div className={cx('item-text')}>Profile</div>
          <img className={cx('item-icon')} src={profile} />
        </Link>
        <Link
          className={cx('item')}
          type='navigation'
          action='messages'
          data={{}}
          name=''>
          <div className={cx('item-text')}>Conversations</div>
          <img className={cx('item-icon')} src={conversations} />
        </Link>
        <Link
          className={cx('item')}
          type='navigation'
          action='notifications'
          data={{}}
          name=''>
          <div className={cx('item-text')}>Notifications</div>
          <img className={cx('item-icon')} src={notifications} />
        </Link>
        <Link
          className={cx('item')}
          type='navigation'
          action='lists'
          data={{}}
          name=''>
          <div className={cx('item-text')}>Lists</div>
          <img className={cx('item-icon')} src={lists} />
        </Link>
        <div className={cx('item')}>
          <div className={cx('item-text')}>Settings</div>
          <img className={cx('item-icon')} src={settings} />
        </div>
        <div className={cx('item')}>
          <div className={cx('item-text')}>About</div>
          <img className={cx('item-icon')} src={about} />
        </div>
      </div>
    );
  }
}

Main.propTypes = {

};
