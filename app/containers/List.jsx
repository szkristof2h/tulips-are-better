import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link as Linkz } from 'react-router';
import Link from '../components/Link';
import ListItem from '../components/ListItem';
import classNames from 'classnames/bind';
import styles from '../css/components/list';

import cover from "../images/cover.png";
import logo from "../images/logo.png";
import follow from "../images/fiction/follow_w60.png";

import categories from "../images/fiction/categories_w60.png";
import options from "../images/fiction/options_w60.png";
import tags from "../images/fiction/hash_w60.png";

const cx = classNames.bind(styles);

class List extends Component {
  render() {
    const { activeFiction, currentUser, children, expanded, isFetching, fiction, ratings, stats, users } = this.props;
    if (isFetching !== 'list_loaded') return <div>LOADING...</div>;
    
    const isFiction = activeFiction.includes("fictions");
    const isList = activeFiction.includes("list");
    const isUser = activeFiction.includes("users");
    const followed = Object.keys(ratings).length == 0 || !ratings[fiction.id] || ratings[fiction.id].follow === 'none' ?
      'none' : ratings[fiction.id].follow;
    const followers = Object.keys(stats).length != 0 && !isList ? stats[fiction.statId].follow : '';
    const empty = Object.keys(children).length == 0 ? true : false;
    const notFound = fiction === undefined || Object.keys(fiction).length == 0 ? true : false;
    const listOwner = isList && fiction.authorIds[0] === currentUser ? true : false;

    return (
      <div className={cx('main')}>
        <img className={cx('logo')} src={logo} />
        {activeFiction === '' && !notFound ? <div className={cx('filter')}>
          <Linkz className={cx('button')} to="/options/">
            <img className={cx('icon')} alt="options" title="options" src={options} />
            <div className={cx('b-text')}>OPTIONS</div>
          </Linkz>
          <Linkz className={cx('button')} to="/categories/">
            <img className={cx('icon')} alt="categories" title="categories" src={categories} />
            <div className={cx('b-text')}>CATEGORIES</div>
          </Linkz>
          <Linkz className={cx('button')} to="/tags/">
            <img className={cx('icon')} alt="tags" title="tags" src={tags} />
            <div className={cx('b-text')}>TAGS</div>
          </Linkz>
          <div className={cx('content')}>
            <div className={cx('options')}>
              <div className={cx('sort')}>
                <div className={cx('header')}>SORT BY</div>
                <Linkz to="//" className={cx('d-text')}>TITLE</Linkz>
                <Linkz to="//" className={cx('d-text')}>LENGTH</Linkz>
                <Linkz to="//" className={cx('d-text')}>RATING</Linkz>
                <Linkz to="//" className={cx('d-text')}>POPULARITY</Linkz>
                <Linkz to="//" className={cx('d-text')}>FOLLOWERS</Linkz>
                <Linkz to="//" className={cx('d-text')}>FAVORITES</Linkz>
                <Linkz to="//" className={cx('d-text')}>LAST UPDATED</Linkz>
                <Linkz to="//" className={cx('d-text')}>RELEASE FREQUENCY</Linkz>
              </div>
              <div className={cx('order')}>
                <div className={cx('header')}>ORDER</div>
                <Linkz to="//" className={cx('d-text')}>ASCENDING</Linkz>
                <Linkz to="//" className={cx('d-text')}>DESCENDING</Linkz>
              </div>
              <div className={cx('length')}>
                <div className={cx('header')}>PAGES</div>
                <div className={cx('placeholder')}></div>
                <div className={cx('d-text')}>MORE THAN</div>
                <input type="text" className={cx('d-input')} />
                <div className={cx('placeholder')}></div>
                <div className={cx('d-text')}>LESS THAN</div>
                <input type="text" className={cx('d-input')} />
                <div className={cx('placeholder')}></div>
              </div>
              <div className={cx('status')}>
                <div className={cx('header')}>STATUS</div>
                <div className={cx('container')}>
                  <div className={cx('checkbox')}>☐</div>
                  <div className={cx('d-text')}>COMPLETED</div>
                </div>
                <div className={cx('container')}>
                  <div className={cx('checkbox')}>☐</div>
                  <div className={cx('d-text')}>ACTIVE</div>
                </div>
                <div className={cx('container')}>
                  <div className={cx('checkbox')}>☐</div>
                  <div className={cx('d-text')}>HIATUS</div>
                </div>
                <div className={cx('container')}>
                  <div className={cx('checkbox')}>☐</div>
                  <div className={cx('d-text')}>DROPPED</div>
                </div>
              </div>
            </div>
            <div className={cx('categories')}>
              <div className={cx('checkbox')}>☒</div>
              <div className={cx('d-text')}>ACTION</div>
              <div className={cx('checkbox')}>☐</div>
              <div className={cx('d-text')}>ADVENTURE</div>
              <div className={cx('checkbox')}>☑</div>
              <div className={cx('d-text')}>COMEDY</div>
              <div className={cx('checkbox')}>☐</div>
              <div className={cx('d-text')}>CRIME</div>
              <div className={cx('checkbox')}>☐</div>
              <div className={cx('d-text')}>DRAMA</div>
              <div className={cx('checkbox')}>☐</div>
              <div className={cx('d-text')}>FANTASY</div>
              <div className={cx('checkbox')}>☐</div>
              <div className={cx('d-text')}>HISTORICAL</div>
              <div className={cx('checkbox')}>☐</div>
              <div className={cx('d-text')}>HORROR</div>
              <div className={cx('checkbox')}>☐</div>
              <div className={cx('d-text')}>MYSTERY</div>
              <div className={cx('checkbox')}>☐</div>
              <div className={cx('d-text')}>ROMANCE</div>
              <div className={cx('checkbox')}>☐</div>
              <div className={cx('d-text')}>SCI-FI</div>
              <div className={cx('checkbox')}>☐</div>
              <div className={cx('d-text')}>SLICE OF LIFE</div>
              <div className={cx('checkbox')}>☐</div>
              <div className={cx('d-text')}>THRILLER</div>
              <div className={cx('checkbox')}>☐</div>
              <div className={cx('d-text')}>WESTERN</div>
              <div className={cx('checkbox')}>☐</div>
              <div className={cx('d-text')}>XIANXIA</div>
              <div className={cx('checkbox')}>☐</div>
              <div className={cx('d-text')}>XUANHUAN</div>
            </div>
            <div className={cx('tags', 'hidden')}>
              <div className={cx('search')}>
                WRITE A TAG...
              </div>
              <div className={cx('checkbox')}>
                ☒
              </div>
              <div className={cx('d-text')}>
                MALE PROTAGONIST
              </div>
              <div className={cx('checkbox')}>
                ☐
              </div>
              <div className={cx('d-text')}>
                FEMALE PROTAGONIST
              </div>
              <div className={cx('checkbox')}>
                ☑
              </div>
              <div className={cx('d-text')}>
                WEAK TO STRONG
              </div>
              <div className={cx('checkbox')}>
                ☐
              </div>
              <div className={cx('d-text')}>
                CULTIVATION
              </div>
              <div className={cx('checkbox')}>
                ☐
              </div>
              <div className={cx('d-text')}>
                DRAGONS
              </div>
              <div className={cx('checkbox')}>
                ☐
              </div>
              <div className={cx('d-text')}>
                MAGIC
              </div>
              <div className={cx('checkbox')}>
                ☐
              </div>
              <div className={cx('d-text')}>
                MODERN DAY
              </div>
              <div className={cx('checkbox')}>
                ☐
              </div>
              <div className={cx('d-text')}>
                MONSTERS
              </div>
              <div className={cx('checkbox')}>
                ☐
              </div>
              <div className={cx('d-text')}>
                FANTASY WORLD
              </div>
              <div className={cx('checkbox')}>
                ☐
              </div>
              <div className={cx('d-text')}>
                OVERPOWERED PROTAGONIST
              </div>
              <div className={cx('checkbox')}>
                ☐
              </div>
              <div className={cx('d-text')}>
                PROTAGONIST STRONG FROM THE START
              </div>
              <div className={cx('checkbox')}>
                ☐
              </div>
              <div className={cx('d-text')}>
                REVENGE
              </div>
              <div className={cx('checkbox')}>
                ☐
              </div>
              <div className={cx('d-text')}>
                SPECIAL ABILITIES
              </div>
              <div className={cx('checkbox')}>
                ☐
              </div>
              <div className={cx('d-text')}>
                CUNNING PROTAGONIST
              </div>
              <div className={cx('checkbox')}>
                ☐
              </div>
              <div className={cx('d-text')}>
                DUMB PROTAGONIST
              </div>
            </div>
          </div>
        </div> : ''}
        {!notFound && fiction && <div className={cx('fiction', {profile: !isFiction && !isList, list: isList})}>
          {isList ? '' : <img className={cx('cover')} alt="fiction cover" title="cover" src={cover} />}
          <div className={cx('container')}>
            <div className={cx('header')}>
              <div className={cx('title')}>{fiction.title ? fiction.title : 'Fictions'}</div>
              {isList ? '' :
                <div className={cx('author')}>
                by&nbsp;
                <Link
                  className={cx('link', 'ellipsis')}
                  type='user'
                  action='profile'
                  data={{ name: users[fiction.authorIds[0]].name, id: fiction.authorIds[0] }}
                  name={users[fiction.authorIds[0]].name} />
                </div>}
            </div>
            {isList ? '' : <Link
              className={cx('button', { active: followed != "none" })}
              type='fiction'
              action={followed === 'none' ? 'follow' : 'follow_remove'}
              data={{ id: fiction.id, rId: followed, type: 'follow' }}
              name=''>
              <img className={cx('icon')} src={follow} alt={followed != "none" ? "cancel follow" : "follow"}
                title={followed != "none" ? "cancel follow" : "follow"} />
              <div className={cx('b-count')}>{followers}</div>
              <div className={cx('b-text')}>FOLLOW</div>
            </Link>}
          </div>
        </div>}
        <ListItem 
          activeFiction={activeFiction}
          children={children}
          expanded={expanded}
          fiction={fiction}
          isEmpty={empty}
          isFiction={isFiction}
          isList={isList}
          listOwner={listOwner}
          notFound={notFound}
          stats={stats}
          users={users} />
      </div>
    );
  }
}

List.propTypes = {
  activeFiction: PropTypes.string,
  children: PropTypes.object.isRequired,
  currentUser: PropTypes.string.isRequired,
  expanded: PropTypes.array.isRequired,
  fiction: PropTypes.object,
  isFetching: PropTypes.string.isRequired,
  ratings: PropTypes.object,
  stats: PropTypes.object.isRequired,
  users: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    activeFiction: state.fiction.activeFiction,
    children: state.fiction.childrenById,
    currentUser: state.user.currentUser.id,
    expanded: state.fiction.expanded || [],
    fiction: state.fiction.fictionsById[state.fiction.activeFiction],
    isFetching: state.fiction.isFetching,
    ratings: state.rating.ratings,
    stats: state.statistics.statisticsById,
    users: state.user.usersById
  };
}

export default connect(mapStateToProps, null)(List);
