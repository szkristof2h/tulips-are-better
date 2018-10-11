import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Link from '../components/Link';
import classNames from 'classnames/bind';
import styles from '../css/components/lists';

import add_w40 from "../images/add_w40.png";
import delete_w40 from "../images/delete_w40.png";
import logo from "../images/logo.png";
import message_w40 from "../images/profile/message_w40.png";
import read_w40 from "../images/read_w40.png";
import settings_w40 from "../images/settings.png";
import star_w40 from "../images/star_w40.png";

const cx = classNames.bind(styles);

class Lists extends Component {
  render() {
    const { activeUser, currentUser, listIds, lists, isFetching, status, users } = this.props;

    if (isFetching !== 'lists_loaded') return <div>LOADING...</div>;
    if (status !== '' && (listIds === undefined || listIds == null || listIds.length == 0)) return <img className={cx('logo')} src={logo} />;
    
    const listCount = users[activeUser].listCount;
    return (
      <div className={cx('main')}>
        <img className={cx('logo')} src={logo} />
        {activeUser === currentUser && <Link
          className={cx('button')}
          type='list'
          action='add'
          data={{ id: activeUser }}
          name=''>
          <img className={cx('icon')} alt="add list" title="new list" src={add_w40} />
          <div className={cx('b-text')}>CREATE NEW LIST</div>
        </Link>}
        {listIds.length != 0 ? <ul className={cx('lists')}>
          <li className={cx('title')}>Lists ({listCount})</li>
          {listIds.map((l, i) =>
          <li key={`lL${l}${i}`} className={cx('list')}>
            <Link
              className={cx('container')}
              type='list'
              action='list'
              data={{ id: l, title: lists[l].title }}
              name=''>
                <img className={cx('icon')} alt="star" title="star" src={lists[l].title === 'completed' ? star_w40 :
                  lists[l].title === 'reading' ? read_w40 : lists[l].title === 'dropped' ? message_w40 : message_w40 } />
              <div className={cx('d-text', 'ellipsis')}>{lists[l].title}</div>
              </Link>
              {activeUser === currentUser && <Link
                className={cx('button')}
                type='list'
                action='edit'
                data={{ id: l }}
                name=''>
                <img className={cx('icon')} alt="edit list" title="edit list" src={settings_w40} />
              </Link>}
              {activeUser === currentUser && <Link
                className={cx('button')}
                type='list'
                action='delete'
                data={{ id: l }}
                name=''>
              <img className={cx('icon')} alt="delete list" title="delete list" src={delete_w40} />
              </Link>}
          </li>)}
          {listCount >= listIds.length && <Link
            className={cx('expand')}
            type='list'
            action='expand'
            data={{ id: activeUser, offset: listIds.length }}
            name='SHOW MORE' />}
        </ul> : <div>User doesn't have any lists!</div>}
      </div>
    );
  }
}

Lists.propTypes = {
  activeUser: PropTypes.string.isRequired,
  currentUser: PropTypes.string.isRequired,
  isFetching: PropTypes.string.isRequired,
  listIds: PropTypes.array.isRequired,
  lists: PropTypes.object.isRequired,
  users: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    activeUser: state.user.activeUser,
    currentUser: state.user.currentUser.id,
    isFetching: state.list.isFetching,
    listIds: state.list.listIds,
    lists: state.list.listsById,
    status: state.list.status,
    users: state.user.usersById
  };
}

export default connect(mapStateToProps, null)(Lists);