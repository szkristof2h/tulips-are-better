import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import requiredIf from 'react-required-if';
import classNames from 'classnames/bind';
import styles from '../css/components/profile';
import Link from '../components/Link';
import TextBox from '../components/TextBox';
import { toDate } from '../utils/misc';

import logo from "../images/logo.png";
import sample from "../images/sample/profile.png";
import author from "../images/article_author.png";

import add_w40 from "../images/profile/add_friend_w40.png";
import message_w40 from "../images/profile/message_w40.png";
import report_w40 from "../images/profile/report_w40.png";

import country_g20 from "../images/profile/g20/country_g20.png";
import date_g20 from "../images/profile/g20/date_g20.png";
import email_g20 from "../images/profile/g20/email_g20.png";
import gender_g20 from "../images/profile/g20/gender_g20.png";
import website_g20 from "../images/profile/g20/site_g20.png";

const cx = classNames.bind(styles);

class Profile extends Component {
  render() {
    const { activeUser, currentUser, isFetching, stats, users } = this.props;
    
    if (isFetching !== 'profile_loaded') return <div>LOADING...</div>;
    if (activeUser === '') return <div>USER NOT FOUND</div>;
    
    const connection = !users[activeUser].connection ? 'none' : users[activeUser].connection;
    const connectionId = !users[activeUser].connection ? 'none' : users[activeUser].connection.id;
    return (
      <div className={cx('main')}>
        <img className={cx('logo')} src={logo} />
        <div className={cx('infobox')}>
          <div className={cx('avatar')}>
            <Link
              className={cx('container')}
              type='user'
              action='open_avatar'
              data={{ id: activeUser }}
              name=''>
              <img alt="avatar" title="profile picture" src={sample} />
            </Link>
            {currentUser && activeUser == currentUser && <Link
              className={cx('h-text')}
              type='user'
              action='change_avatar'
              data={{ id: activeUser }}
              name='Change' />}
          </div>
          <Link
            className={cx('button', { active: connection !== 'none' })}
            type='user'
            action={connection === 'none' ? 'add_friend' : 'remove_friend'}
            data={{ id: activeUser, cId: connectionId.replace('connectedTo/', '') }}
            name='' >
            <img className={cx('icon')} alt="add as a friend" title="add as a friend" src={add_w40} />
            <div className={cx('b-text')}>
              {activeUser == currentUser ? '-' : connection !== 'none' ? connection.type === 'friends' ? 'ADDED' : 
              connection.type === 'request' ? 'PENDING' : 'ADD' : 'ADD'}
            </div>
          </Link>
          <Link
            className={cx('button')}
            type='user'
            action='send_message'
            data={{ id: activeUser }}
            name='' >
            <img className={cx('icon')} alt="message user" title="message user" src={message_w40} />
            <div className={cx('b-text')}>MESSAGE</div>
          </Link>
          <Link
            className={cx('button')}
            type='user'
            action='report'
            data={{ id: activeUser }}
            name='' >
            <img className={cx('icon')} alt="report user" title="report user" src={report_w40} />
            <div className={cx('b-text')}>REPORT</div>
          </Link>
          <div className={cx('details')}>
            <div className={cx('title')}>{users[activeUser].displayName}</div>
            <img className={cx('icon')} alt="Full Name" title="Full Name" src={author} />
            <div className={cx('d-text', 'ellipsis')}>{users[activeUser].fullName}</div>
            <img className={cx('icon')} alt="birthday" title="birthday" src={date_g20} />
            <div className={cx('d-text', 'ellipsis')}>{toDate(users[activeUser].birthDate, '')}</div>
            <img className={cx('icon')} alt="email" title="email" src={email_g20} />
            <div className={cx('d-text', 'ellipsis')}>{users[activeUser].email}</div>
            <img className={cx('icon')} alt="country" title="country" src={country_g20} />
            <div className={cx('d-text', 'ellipsis')}>{users[activeUser].location}</div>
            <img className={cx('icon')} alt="gender" title="gender" src={gender_g20} />
            <div className={cx('d-text', 'ellipsis')}>{users[activeUser].gender}</div>
            <img className={cx('icon')} alt="website" title="website" src={website_g20} />
            <div className={cx('d-text', 'ellipsis')}>{users[activeUser].website}</div>
            <TextBox className={cx('about')} value={users[activeUser].bio} />
          </div>
        </div>
        {users[activeUser].friendIds.length != 0 ? <ul className={cx('friends')}>
          <li className={cx('title')}>{users[activeUser].displayName}'s friends ({stats[users[activeUser].statId]
            .friendsCount})
          </li>
          {users[activeUser].friendIds.map((f, i) =>
            <li key={`pU${f}${i}`} className={cx('user')}>
              <Link
                className={cx('container')}
                type='user'
                action='profile'
                data={{ name: users[f].name, id: f }}
                name='' >
                <img className={cx('icon')} alt="Profile picture" title="Profile picture" src={sample} />
              </Link>
              <Link
                className={cx('d-text', 'ellipsis')}
                type='user'
                action='profile'
                data={{ name: users[f].name, id: f }}
                name={users[f].name} />
              <div className={cx('d-text')}>{users[f].title}</div>
              <div className={cx('buttons')}>
                <Link
                  className={cx('button')}
                  type='user'
                  action='add_friend'
                  data={{ id: f }}
                  name='' >
                  <img className={cx('icon')} alt="add as friend" title="add as friend" src={add_w40} />
                  <div className={cx('b-text')}>{activeUser == currentUser ? '-' : 'ADD'}</div>
                </Link>
                <Link
                  className={cx('button')}
                  type='user'
                  action='profile'
                  data={{ name: users[f].name, id: f }}
                  name='' >
                  <img className={cx('icon')} alt="send message" title="send message" src={message_w40} />
                  <div className={cx('b-text')}>MESSAGE</div>
                </Link>
              </div>
            </li>)}
          {stats[users[activeUser].statId].friendsCount > users[activeUser].friendIds.length &&
            <Link
              className={cx('expand')}
              type='user'
              action='expand_friends'
              data={{ id: activeUser, offset: users[activeUser].friendIds.length }}
              name='MORE' />
          }
        </ul> : <div></div>}
        <div className={cx('menu')}>
          <Link
            className={cx('button')}
            type='user'
            action='fictions'
            data={{ id: activeUser, name: users[activeUser].name, skip: 0, draft: false }}
            name=''>
            <img className={cx('icon')} alt="fictions by user" title="fictions by user" src={add_w40} />
            <div className={cx('b-text')}>WORKS</div>
            <div className={cx('b-count')}>{stats[users[activeUser].statId].childrenCount}</div>
          </Link>
          <Link
            className={cx('button')}
            type='user'
            action='chapters'
            data={{ id: activeUser }}
            name=''>
            <img className={cx('icon')} alt="chapters by user" title="chapters by user" src={message_w40} />
            <div className={cx('b-text')}>CHAPTERS</div>
            <div className={cx('b-count')}>{stats[users[activeUser].statId].chapterCount}</div>
          </Link>
          <Link
            className={cx('button')}
            type='user'
            action='reviews'
            data={{ id: activeUser }}
            name=''>
            <img className={cx('icon')} alt="reviews by user" title="reviews by user" src={report_w40} />
            <div className={cx('b-text')}>REVIEWS</div>
            <div className={cx('b-count')}>{stats[users[activeUser].statId].reviewCount}</div>
          </Link>
          <Link
            className={cx('button')}
            type='user'
            action='favorites'
            data={{ id: activeUser }}
            name=''>
            <img className={cx('icon')} alt="user's favorites" title="user's favorites" src={add_w40} />
            <div className={cx('b-text')}>FAVORITES</div>
            <div className={cx('b-count')}>{stats[users[activeUser].statId].favoriteCount}</div>
          </Link>
          <Link
            className={cx('button')}
            type='user'
            action='lists'
            data={{ id: activeUser }}
            name=''>
            <img className={cx('icon')} alt="lists" title="lists" src={add_w40} />
            <div className={cx('b-text')}>LISTS</div>
            <div className={cx('b-count')}>{stats[users[activeUser].statId].listCount}</div>
          </Link>
        </div>
      </div>
    );
  }
}

Profile.propTypes = {
  activeUser: requiredIf(PropTypes.string, props => props.isFetching === 'profile_loaded'),
  currentUser: PropTypes.string,
  stats: requiredIf(PropTypes.object, props => props.isFetching === 'profile_loaded'),
  isFetching: PropTypes.string.isRequired,
  users: requiredIf(PropTypes.object, props => props.isFetching === 'profile_loaded')
};

function mapStateToProps(state) {
  return state.user.isFetching !== 'profile_loaded' ? { isFetching: state.user.isFetching } : {
    activeUser: state.user.activeUser,
    currentUser: state.user.currentUser.id,
    isFetching: state.user.isFetching,
    stats: state.statistics.statisticsById,
    users: state.user.usersById
  };
}

export default connect(mapStateToProps, null)(Profile);