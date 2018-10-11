import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Comment from '../components/comment/Comment';
import Link from '../components/Link';
import classNames from 'classnames/bind';
import styles from '../css/components/conversation';

import logo from "../images/logo.png";

// unused & old, needs to be reworked
const cx = classNames.bind(styles);

class Conversation extends Component {
  render() {
    const { comments, conversation, conversationId, isFetching, users } = this.props;

    if (isFetching !== 'conversation_loaded') return <div>LOADING...</div>;

    const offset = conversation ? conversation.ids.length : 0;
    return (
      <div className={cx('main')}>
        <img className={cx('logo')} src={logo} />
        <ul className={cx('list')}>
          {conversation && conversation.ids.length != 0 ? conversation.ids.map(c =>
            <Comment
              key={`coC${c}`}
              id={c}
              author={users[comments[c].authorId].name}
              authorId={comments[c].authorId}
              avatar={users[comments[c].authorId].avatar}
              date={comments[c].date}
              down={'none'}
              downvotes={0}
              edited={comments[c].edited}
              level={0}
              replies={0}
              replyTo={null}
              text={comments[c].text}
              type={comments[c].type}
              up={'none'}
              upvotes={0}
              userId={''}
              score={null}
            />
          ) : <li className={cx('info')}>There are no comments!</li>}
          {conversation && conversation.ids.length !== conversation.messageCount ?
              <li>
                <Link
                  className={cx('expand')}
                  type={'conversation'}
                  action={'more_message'}
                  data={{ id: conversationId.replace('conversations/', ''), offset: offset }}
                  name={'Load messages'} />
              </li>
              : ''}
        </ul>
      </div>
    );
  }
}

Conversation.propTypes = {
  comments: PropTypes.object.isRequired,
  conversation: PropTypes.object.isRequired,
  conversationId: PropTypes.string.isRequired,
  currentUser: PropTypes.string.isRequired,
  isFetching: PropTypes.string.isRequired,
  users: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    comments: state.comment.commentsById,
    conversation: state.comment.conversationsById[state.comment.conversationIds[0]],
    conversationId: state.comment.conversationIds[0],
    currentUser: state.user.currentUser.id,
    isFetching: state.comment.isFetching,
    users: state.user.usersById
  };
}

export default connect(mapStateToProps, {})(Conversation);