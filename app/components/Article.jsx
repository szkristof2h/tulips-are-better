import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Link from '../components/Link';
import TextBox from '../components/TextBox';
import classNames from 'classnames/bind';
import styles from '../css/components/article';

import { toDate } from '../utils/misc';

import cover from "../images/cover.png";

import info from "../images/info.png";
import author_g20 from "../images/article_author.png";
import comments from "../images/article_comments.png";
import date from "../images/article_date.png";

import up_w20 from "../images/fiction/w20/up_w20.png";
import down_w20 from "../images/fiction/w20/down_w20.png";
import down from "../images/fiction/down_w60.png";
import up from "../images/fiction/up_w60.png";
const cx = classNames.bind(styles);

export default class Article extends Component {
  render() {
    const { author, authorId, book, chapter, commentCount, createdAt, downed, downvotes, expanded, featured, id, upped,
      upvotes, volume } = this.props;

    const volumeTitle = volume ? `Vol. ${volume} ` : '';
    const ratings = upvotes + downvotes;
    const downStyle = { height: ratings == 0 ? 35 : downvotes == 0 ? 0 : (70 / (upvotes + downvotes) * downvotes) + 'px'};
    const upStyle = { height: ratings == 0 ? 35 : upvotes == 0 ? 0 : (70 / (upvotes + downvotes) * upvotes) + 'px'};
    return (
      <li className={cx('article', { featured: featured })}>
        {featured ? <img className={cx('thumbnail')} src={cover} /> :
          <div className={cx('ratio')}>
            <div className={cx('up')} style={upStyle} ></div>
            <div className={cx('down')} style={downStyle}></div>
            <div className={cx('extended')}>
              <Link
                className={cx('up', { active: upped !== 'none' })}
                type='chapter'
                action={upped === 'none' ? 'up' : 'up_remove'}
                data={{ id, rId: upped, type: 'up' }}
                name=''>
                <img className={cx('icon')} src={up_w20} alt={upped != "none" ? "cancel upvote" : "upvote"} 
                  title={upped != "none" ? "cancel upvote" : "upvote"} />
                <img className={cx('icon-60')} src={up} alt={upped != "none" ? "cancel upvote" : "upvote"} 
                  title={upped != "none" ? "cancel upvote" : "upvote"} />
                <div className={cx('b-text', 'ellipsis')}>{upvotes}</div>
              </Link>
              <Link
                className={cx('down', { active: downed !== 'none' })}
                type='chapter'
                action={downed === 'none' ? 'down' : 'down_remove'}
                data={{ id, rId: downed, type: 'down' }}
                name=''>
                <img className={cx('icon')} src={down_w20} alt={downed != "none" ? "cancel downvote" : "downvote"} 
                  title={downed != "none" ? "cancel downvote" : "downvote"} />
                <img className={cx('icon-60')} src={down} alt={downed != "none" ? "cancel downvote" : "downvote"} 
                  title={downed != "none" ? "cancel downvote" : "downvote"} />
                <div className={cx('b-text', 'ellipsis')}>{downvotes}</div>
              </Link>
          </div>
          </div>}
        <Link
          className={cx('body')}
          type='fiction'
          action='chapter'
          data={{ id: id.replace('articles/', ''), book: book.title, num: chapter.num }}
          name=''>
          <div className={cx('title', 'ellipsis')}>{`${book.title} - ${volumeTitle}Ch. ${chapter.num}`}</div>
          <img className={cx('icon')} src={author_g20} alt="author" title="posted by" />
          <div
            className={cx('d-text', 'ellipsis')}>{author} </div>
          <img className={cx('icon')} src={date} alt="date" title="posted on" />
          <div className={cx('d-text')}>{toDate(createdAt)}</div>
          <img className={cx('icon')} src={comments} alt="comments" title="comment count" />
          <div className={cx('d-text')}>{commentCount}</div>
        </Link>
        <Link
          className={cx('button')}
          type='fiction'
          action='expand'
          data={{ id: featured ? `f${id}`: id }}
          name=''>
          <img src={info} alt="information" title="information about the fiction" />
        </Link>
        <TextBox className={cx('text', 'summary', { expanded: expanded })} value={book.summary} />
      </li>
          
    );
  }
}

Article.propTypes = {
  authorNote: PropTypes.string,
  id: PropTypes.string,
  title: PropTypes.string,
  categories: PropTypes.array,
  tags: PropTypes.array,
  authors: PropTypes.array
};