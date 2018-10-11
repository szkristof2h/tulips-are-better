import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import requiredIf from 'react-required-if';
import Link from '../components/Link';
import classNames from 'classnames/bind';
import styles from '../css/components/conversations';

import logo from "../images/logo.png";
import sample from "../images/sample/profile.png";
import read_w40 from "../images/read_w40.png";
import delete_w40 from "../images/delete_w40.png";
import star_w40 from "../images/star_w40.png";
import add_w40 from "../images/add_w40.png";
import group_w40 from "../images/group_w40.png";
import message_w40 from "../images/profile/message_w40.png";

const cx = classNames.bind(styles);

class Conversations extends Component {
  render() {
    const { conversations, currentUser, filter, ids, isFetching, users, stats } = this.props;

    if (isFetching !== 'conversations_loaded') return <div>LOADING...</div>;

    return (
      <div className={cx('main')}>
        <img className={cx('logo')} src={logo} />
        <div className={cx('menu')}>
          <Link
            className={cx('button', { active: filter === 'inbox' })}
            type={'conversation'}
            action={'inbox'}
            data={{ id: currentUser }}
            name=''>
            <img className={cx('icon')} alt="fictions" title="fictions" src={message_w40} />
            <div className={cx('b-text')}>INBOX</div>
            <div className={cx('b-count')}>{stats ? stats.inboxCount : 0}</div>
          </Link>
          <Link
            className={cx('button', { active: filter === 'starred' })}
            type={'conversation'}
            action={'starred'}
            data={{ id: currentUser }}
            name=''>
            <img className={cx('icon')} alt="fictions" title="fictions" src={star_w40} />
            <div className={cx('b-text')}>STARRED</div>
            <div className={cx('b-count')}>{stats ? stats.starredCount : 0}</div>
          </Link>
          <Link
            className={cx('button', { active: filter === 'trashed' })}
            type={'conversation'}
            action={'trashed'}
            data={{ id: currentUser }}
            name=''>
            <img className={cx('icon')} alt="friends" title="friends" src={delete_w40} />
            <div className={cx('b-text')}>TRASH</div>
            <div className={cx('b-count')}>{stats ? stats.trashedCount : 0}</div>
          </Link>
          <Link
            className={cx('button', { active: filter === 'trashed' })}
            type={'conversation'}
            action={'new'}
            data={{ id: currentUser }}
            name=''>
            <img className={cx('icon')} alt="favorites" title="favorites" src={add_w40} />
            <div className={cx('b-text')}>NEW</div>
          </Link>
          <Link
            className={cx('button', { active: filter === 'trashed' })}
            type={'conversation'}
            action={'join'}
            data={{ id: currentUser }}
            name=''>
            <img className={cx('icon')} alt="lists" title="lists" src={group_w40} />
            <div className={cx('b-text')}>JOIN</div>
          </Link>
        </div>
        <ul className={cx('conversations')}>
          <li className={cx('title')}>Conversations ({stats ? stats[filter + 'Count'] : 0})</li>
          {ids.length != 0 ? ids.map((c, i) =>
            <li key={c} className={cx('conversation')}>
              <Link
                className={cx('button', { active: conversations[c].starred })}
                type={'conversation'}
                action={conversations[c].starred ? 'unstar' : 'star'}
                data={{ id: c }}
                name=''>
                <img className={cx('icon')} alt="star" title="star" src={star_w40} />
              </Link>
              <Link
                className={cx('button')}
                type={'user'}
                action={'profile'}
                data={{ id: conversations[c].userIds[0], name: users[conversations[c].userIds[0]].name }}
                name='' >
                <img className={cx('icon')} alt="Profile picture" title="Profile picture" src={sample} />
              </Link>
              <Link
                className={cx('d-text', 'ellipsis')}
                type={'user'}
                action={'profile'}
                data={{ id: conversations[c].userIds[0], name: users[conversations[c].userIds[0]].name }}
                name={users[conversations[c].userIds[0]].name} />
              <div className={cx('d-text')}>{conversations[c].updatedAt}</div>
              <Link
                className={cx('button')}
                type={'conversation'}
                action={filter === 'trashed' ? 'untrash' : 'message'}
                data={{ id: c }}
                name=''>
                <img className={cx('icon')} alt="read conversation" title="read conversation" src={read_w40} />
              </Link>
              <Link
                className={cx('button', { active: filter === 'trashed' })}
                type={'conversation'}
                action={filter === 'trashed' ? 'delete' : 'trash'}
                data={{ id: c }}
                name=''>
                <img className={cx('icon')} alt={filter === 'trashed' ? "delete conversation" : "move to trash"}
                  title={filter === 'trashed' ? "delete conversation" : "move to trash"} src={delete_w40} />
              </Link>
            </li>
          ) : <li>No messages!</li>}
        </ul>
      </div>
    );
  }
}

Conversations.propTypes = {
  currentUser: requiredIf(PropTypes.string, props => props.isFetching === 'conversations_loaded'),
  conversations: requiredIf(PropTypes.object, props => props.isFetching === 'conversations_loaded'),
  filter: requiredIf(PropTypes.string, props => props.isFetching === 'conversations_loaded'),
  ids: requiredIf(PropTypes.array, props => props.isFetching === 'conversations_loaded'),
  isFetching: PropTypes.string.isRequired,
  users: requiredIf(PropTypes.object, props => props.isFetching === 'conversations_loaded'),
  stats: requiredIf(PropTypes.object, props => props.isFetching === 'conversations_loaded')
};

function mapStateToProps(state) {
  return state.comment.isFetching !== 'conversations_loaded' ? { isFetching: state.comment.isFetching } : {
    conversations: state.comment.conversationsById,
    currentUser: state.user.currentUser.id,
    filter: state.comment.filter,
    ids: state.comment.conversationIds,
    isFetching: state.comment.isFetching,
    users: state.user.usersById,
    stats: state.statistics.statisticsById[state.statistics.activeStat]
  };
}

export default connect(mapStateToProps, null)(Conversations);