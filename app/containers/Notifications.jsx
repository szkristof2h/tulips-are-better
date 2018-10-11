import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import requiredIf from 'react-required-if';
import Link from '../components/Link';
import classNames from 'classnames/bind';
import styles from '../css/components/notifications';

import { toDate } from '../utils/misc';

import logo from "../images/logo.png";
import checkbox_w40 from "../images/checkbox_w40.png";
import settings_w40 from "../images/settings.png";
import tick_w40 from "../images/tick_w40.png";

const cx = classNames.bind(styles);

class Notifications extends Component {
  render() {
    const { currentUser, ids, isFetching, notifications, users } = this.props;

    if (isFetching !== 'notifications_loaded') return <div>LOADING...</div>;

    return (
      <div className={cx('main')}>
        <img className={cx('logo')} src={logo} />
        <ul className={cx('lists')}>  
          {ids.length === 0 ? <li className={cx('title')}>You don't have any new updates!</li>
            : <li className={cx('title')}>{`Notifications (${ids.length})`}</li>}
          {ids.length !== 0 ? <li className={cx('container')}>
            <Link
              className={cx('button')}
              type='fiction'
              action='fiction'
              data={{ id: 5, title: 'FB' }}
              name=''>
              <img className={cx('icon')} alt="settings" title="settings" src={settings_w40} />
            </Link>
          </li> : ''}
          {ids.length !== 0 ? ids.map((id, i) =>
            <li key={`nL${id}${i}`} className={cx('list')}>
              {notifications[id].type === 'chapter' ?
                <div className={cx('container', 'ellipsis')}>
                  <Link
                    className={cx('d-text')}
                    type='fiction'
                    action='fiction'
                    data={{ id: notifications[id].parentId, title: notifications[id].parentTitle }}
                    name={`${notifications[id].parentTitle}: `} />
                  <Link
                    className={cx('d-text')}
                    type='fiction'
                    action='chapter'
                    data={{ id: notifications[id].to.replace('articles/', ''), book: notifications[id].parentTitle,
                      num: notifications[id].num }}
                    name={`#${notifications[id].num} - ${notifications[id].title} `} />{' by '}
                  <Link
                    className={cx('d-text')}
                    type='user'
                    action='profile'
                    data={{ id: notifications[id].author.id, name: notifications[id].author.name }}
                    name={`${notifications[id].author.name}`} />{` (${toDate(notifications[id].createdAt, 'full')})`}
                </div> :
                <div className={cx('container', 'ellipsis')}>
                  <Link
                    className={cx('d-text')}
                    type='fiction'
                    action='fiction'
                    data={{ id: notifications[id].to, title: notifications[id].title }}
                    name={`${notifications[id].title}`} />{`: new ${notifications[id].type} from `}
                  <Link
                    className={cx('d-text')}
                    type='user'
                    action='profile'
                    data={{ id: notifications[id].author.id, name: notifications[id].author.name }}
                    name={`${notifications[id].author.name}`} />{` (${toDate(notifications[id].createdAt, 'full')})`}
                </div>
              }
              <div className={cx('button')}>
                <img className={cx('icon')} alt="delete list" title="delete list" src={notifications[id].seen ? tick_w40 :
                  checkbox_w40} />
              </div>
            </li>)
          : ''}
        </ul>
      </div>
    );
  }
}

Notifications.propTypes = {
  currentUser: requiredIf(PropTypes.string, props => props.isFetching === 'notifications_loaded'),
  ids: requiredIf(PropTypes.array, props => props.isFetching === 'notifications_loaded'),
  isFetching: PropTypes.string.isRequired,
  notifications: requiredIf(PropTypes.object, props => props.isFetching === 'notifications_loaded'),
  users: requiredIf(PropTypes.object, props => props.isFetching === 'notifications_loaded')
};

function mapStateToProps(state) {
  return state.list.isFetching !== 'notifications_loaded' ? { isFetching: state.list.isFetching } : {
    currentUser: state.user.currentUser.id,
    ids: state.list.listIds,
    isFetching: state.list.isFetching,
    notifications: state.list.listsById,
    users: state.user.usersById
  };
}

export default connect(mapStateToProps, { })(Notifications);
