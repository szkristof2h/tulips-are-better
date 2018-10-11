import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Link from '../components/Link';
import TextBox from '../components/TextBox';
import classNames from 'classnames/bind';
import styles from '../css/components/list-item';

import cover from "../images/cover.png";
import delete_w40 from "../images/delete_w40.png";
import info from "../images/info.png";

import author_w20 from "../images/fiction/w20/author_w20.png";
import followers_w20 from "../images/fiction/w20/followers_w20.png";
import frequency from "../images/fiction/w20/frequency_w20.png";
import pages from "../images/fiction/w20/pages_w20.png";
import rating from "../images/fiction/w20/rating_w20.png";

const cx = classNames.bind(styles);

export default class ListItem extends Component {
  render() {
    const { activeFiction, children, expanded, fiction, isEmpty, isFiction, isList, listOwner, notFound,
      stats, users } = this.props;
      
    return (
      <ul className={cx('fictions')}>
        {!isEmpty ? fiction.childrenIds.map((c, i) =>
          <li key={c} className={cx('fiction', { extended: expanded.includes(c) })}>
            <Link
              className={cx('cover')}
              type='fiction'
              action={children[c].type}
              data={{ id: c, title: children[c].title }}
              name=''>
                <img className={cx('')} alt="fiction cover" title="cover" src={cover} />
            </Link>
            <div className={cx('details', 'extended')}>
              <Link
                className={cx('d-title', 'ellipsis')}
                type='fiction'
                action={children[c].type}
                data={{ id: c, title: children[c].title }}
                name={children[c].title} />
              <div className={cx('container')}>
                <div className={cx('placeholder')}></div>
                <img className={cx('')} alt="author" title="author" src={author_w20} />
                <Link
                  className={cx('d-text', 'ellipsis')}
                  type='user'
                  action='profile'
                  data={{ name: users[children[c].authorIds[0]].name, id: children[c].authorIds[0] }}
                  name={users[children[c].authorIds[0]].name} />
                <img className={cx('')} alt="followers" title="followers" src={followers_w20} />
                <div className={cx('d-text')}>{stats[children[c].statId].follow}</div>
                {isFiction ? <img className={cx('')} alt="rating" title="rating" src={rating} /> : ''}
                {isFiction ? <div className={cx('d-text')}>10</div> : ''}
                <img className={cx('')} alt="status" title="status" src={frequency} />
                <div className={cx('d-text')}>{children[c].status}</div>
                <img className={cx('')} alt="pages" title="pages" src={pages} />
                <div className={cx('d-text')}>{stats[children[c].statId].pages}</div>
                <div className={cx('placeholder')}></div>
              </div>
              {isList && listOwner ?
                <Link
                  className={cx('delete')}
                  type='list'
                  action='delete_item'
                  data={{ id: c, lId: activeFiction }}
                  name='' >
                  <img className={cx('')} alt="delete from list" title="delete from list" src={delete_w40} />
                </Link> :
                <Link
                  className={cx('info')}
                  type='list'
                  action='more_info'
                  data={{ id: c }}
                  name='' >
                  <img className={cx('')} alt="more information" title="more information" src={info} />
                </Link>}
            </div>
            <div className={cx('d-categories', 'ellipsis')}>
              {children[c].categories.map(cat =>
                <Link
                  key={`${cat}${c}`}
                  className={cx('d-text')}
                  type='fiction'
                  action='category'
                  data={{ id: cat }}
                  name={cat} />
            )}</div>
            <div className={cx('d-tags')}>
              {children[c] ? children[c].tags.split(',').map(t =>
                <Link
                  key={`${t}${c}`}
                  className={cx('d-text')}
                  type='fiction'
                  action='tag'
                  data={{ id: t }}
                  name={`#${t}`} />
              ) : ''}
            </div>
            <TextBox className={cx('text', 'summary', 'extended')} value={children[c].summary} />
          </li>
        ) : <div>{notFound ? 'It doesn\'t exist!' : 'List is empty!'}</div>}
      </ul>
    );
  }
}

ListItem.propTypes = {
  activeFiction: PropTypes.string,
  children: PropTypes.object.isRequired,
  expanded: PropTypes.array.isRequired,
  fiction: PropTypes.object,
  isEmpty: PropTypes.bool.isRequired,
  isFiction: PropTypes.bool.isRequired,
  isList: PropTypes.bool.isRequired,
  listOwner: PropTypes.bool.isRequired,
  notFound: PropTypes.bool.isRequired,
  stats: PropTypes.object.isRequired,
  users: PropTypes.object.isRequired
};
