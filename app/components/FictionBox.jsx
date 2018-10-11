import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames/bind';
import styles from '../css/components/fiction-box';
import Link from '../components/Link';
import TextBox from '../components/TextBox';

import { toDate } from '../utils/misc';

import cover from "../images/cover.png";

import author_w20 from "../images/fiction/w20/author_w20.png";
import chapters_w20 from "../images/fiction/w20/chapters_w20.png";
import frequency_w20 from "../images/fiction/w20/frequency_w20.png";
import info_w20 from "../images/fiction/w20/info_w20.png";
import pages_w20 from "../images/fiction/w20/pages_w20.png";
import popularity_w20 from "../images/fiction/w20/popularity_w20.png";
import rating_w20 from "../images/fiction/w20/rating_w20.png";
import rating_empty_w20 from "../images/fiction/w20/rating_empty_w20.png";
import updated_w20 from "../images/fiction/w20/date_w20.png";
import views_w20 from "../images/fiction/w20/views_w20.png";

import down from "../images/fiction/down_w60.png";
import donate from "../images/fiction/donate_w60.png";
import favorite from "../images/fiction/favorite_w60.png";
import follow from "../images/fiction/follow_w60.png";
import list from "../images/fiction/list_w60.png";
import rate from "../images/fiction/rate_w40.png";
import read from "../images/fiction/read_w60.png";
import report from "../images/fiction/report_w60.png";
import up from "../images/fiction/up_w60.png";

const cx = classNames.bind(styles);

export default class FictionBox extends Component {
  render() {
    const { authorNote, links, id, title, categories, tags, authors, updatedAt, createdAt, views, pages, chapters,
      upvotes, downvotes, followers, favorites, frequency, reviewId, status, popularity, subscribers,
      upped, downed, followed, favorited, rated, rating, scheduleType, start, subscribed, summary } = this.props;

    const dateC = new Date(createdAt);
    const dateU = new Date(updatedAt);
    const date = toDate(dateC, '');
    const edited = toDate(dateU, '');
    const tagsA = tags.split(',').map(t => t.trim());
    let r = [];

    for (let i = 0; i < (rating[0] | 0); i++) {
      r.push(<img key={`rF${i}`} className={cx('icon')} src={rating_w20} alt="rating" title="rating" />);
    };

    let rL = r.length;

    for (let i = 0; i < 10 - rL; i++) {
      r.push(<img key={`rE${i}`} className={cx('icon')} src={rating_empty_w20} alt="rating" title="rating" />);
    };
    return (
      <div className={cx('infobox')}>
        <div className={cx('title-mobile', 'ellipsis')}>{title}</div>
        <img className={cx('cover')} src={cover} alt="cover" />
        <div className={cx('details')}>
          <div className={cx('title', 'ellipsis')}>{title}</div>
          <div className={cx('rating')}>
            {r}
            <div className={cx('d-text')}>{rating[0]}</div>
          </div>
          <div className={cx('container')}>
            <img className={cx('icon')} src={author_w20} alt="author" title="author" />
            <Link
              className={cx('d-text', 'ellipsis')}
              type='user'
              action='profile'
              data={{ name: authors[0].name, id: authors[0].id }}
              name={authors[0].name} />
            <img className={cx('icon')} src={updated_w20} alt="last updated" title="updated at" />
            <div className={cx('d-text', 'ellipsis')}>{date}</div>
            <img className={cx('icon')} src={updated_w20} alt="created at" title="created at" />
            <div className={cx('d-text', 'ellipsis')}>{edited}</div>
            <img className={cx('icon')} src={pages_w20} alt="pages" title="pages" />
            <div className={cx('d-text', 'ellipsis')}>{pages}</div>
            <img className={cx('icon')} src={chapters_w20} alt="chapters" title="chapters" />
            <div className={cx('d-text', 'ellipsis')}>{chapters}</div>
            <img className={cx('icon')} src={frequency_w20} alt="release frequency"
              title={`release frequency (per ${scheduleType})`} />
            <div className={cx('d-text', 'ellipsis')}>{frequency}</div>
            <img className={cx('icon')} src={views_w20} alt="views" title="total views" />
            <div className={cx('d-text', 'ellipsis')}>{views}</div>
            <img className={cx('icon')} src={info_w20} alt="status" title="status" />
            <div className={cx('d-text', 'ellipsis')}>{status}</div>
            <img className={cx('icon')} src={popularity_w20} alt="popularity" title="popularity" />
            <div className={cx('d-text', 'ellipsis')}>{popularity}</div>
          </div>
          <div className={cx('categories')}>
            <div className={cx('container', 'ellipsis')}>
              {categories.map((c, i) =>
                <Link
                  key={`cat${i}`}
                  className={cx('d-text')}
                  type='fiction'
                  action='category'
                  data={{id: c}}
                  name={c} />
              )}
            </div>
            <Link
              className={cx('d-text')}
              type='fiction'
              action='categories'
              data={{id}}
              name='' />
          </div>
          <div className={cx('tags')}>
            <div className={cx('container', 'ellipsis')}>
              {tagsA.map((t, i) =>
                <Link
                  key={`tag${i}`}
                  className={cx('d-text')}
                  type='fiction'
                  action='tag'
                  data={{ id: t }}
                  name={`#${t}`} />
              )}
            </div>
            <Link
              className={cx('d-text')}
              type='fiction'
              action='tags'
              data={{id}}
              name='' />
          </div>
        </div>
        <div className={cx('buttons')}>
          <Link
            className={cx('button', followed != "none" ? 'active' : '')}
            type='fiction'
            action={followed === 'none' ? 'follow' : 'follow_remove'}
            data={{ id, rId: followed, type: 'follow' }}
            name=''>
            <img className={cx('icon')} src={follow} alt={followed != "none" ? "cancel follow" : "follow"}
              title={followed != "none" ? "cancel follow" : "follow"} />
            <div className={cx('b-count')}>{followers}</div>
            <div className={cx('b-text')}>FOLLOW</div>
          </Link>
          <Link
            className={cx('button', favorited != "none" ? 'active' : '')}
            type='fiction'
            action={favorited === 'none' ? 'favorite' : 'favorite_remove'}
            data={{ id, rId: favorited, type: 'favorite' }}
            name=''>
            <img className={cx('icon')} src={favorite} alt={favorited != "none" ? "cancel favorite" : "favorite"}
              title={favorited != "none" ? "cancel favorite" : "favorite"} />
            <div className={cx('b-count')}>{favorites}</div>
            <div className={cx('b-text')}>FAVORITE</div>
          </Link>
          <Link
            className={cx('button', upped != 'none' ? 'active' : '')}
            type='fiction'
            action={upped === 'none' ? 'up' : 'up_remove'}
            data={{ id, rId: upped, type: 'up' }}
            name=''>
            <img className={cx('icon')} src={up} alt={upped != "none" ? "cancel upvote" : "upvote"}
              title={upped != "none" ? "cancel upvote" : "upvote"} />
            <div className={cx('b-count')}>{upvotes}</div>
            <div className={cx('b-text')}>UPVOTE</div>
          </Link>
          <Link
            className={cx('button', downed != 'none' ? 'active' : '')}
            type='fiction'
            action={downed === 'none' ? 'down' : 'down_remove'}
            data={{ id, rId: downed, type: 'down' }}
            name=''>
            <img className={cx('icon')} src={down} alt={downed != "none" ? "cancel downvote" : "downvote"}
              title={downed != "none" ? "cancel downvote" : "downvote"} />
            <div className={cx('b-count')}>{downvotes}</div>
            <div className={cx('b-text')}>DOWNVOTE</div>
          </Link>
        </div>

        <div className={cx('summary')}>
          <TextBox className={cx('text', 'summary')} value={summary} />
          <hr />
          <p className={cx('author-note')}>AUTHOR'S NOTE</p>
          {authorNote && <TextBox className={cx('text', 'fiction-note')} value={authorNote} />}
          <div className={cx('ratings')}>
            {['overall', 1, 'style', 2, 'grammar', 3, 'story', 4, 'characters', 5].map((t, i) =>
              typeof t == 'string' ? <div key={'fr' + i} className={cx('d-text')}>{t.toUpperCase()}</div> :
                <div key={'fr' + i} className={cx('d-num')}>{rating[t-1]}</div>)}
          </div>
        </div>
        <div className={cx('extra-buttons')}>
          {start ? <Link
            className={cx('button', 'normal')}
            type='fiction'
            action='chapter'
            data={{ book: title, id: start, num: 1 }}
            name=''>
            <img className={cx('icon')} src={read} alt={"start reading"} title={"start reading"} />
            <div className={cx('b-text')}>START</div>
          </Link> :
          <div className={cx('button', 'normal')}>
            <img className={cx('icon')} src={read} alt={"start reading"} title={"start reading"} />
            <div className={cx('b-text')}>START</div>
          </div>
          }
          <Link
            className={cx('button', 'normal')}
            type='fiction'
            action='list'
            data={{ id }}
            name=''>
            <img className={cx('icon')} src={list} alt={"list"} title={"list"} />
            <div className={cx('b-text')}>{"LIST"}</div>
          </Link>
          <Link
            className={cx('button', rated[0] > 0 ? 'active' : '')}
            type='fiction'
            action='open_rate'
            data={{ id: reviewId, hasReview: rated[0] > 0, parentId: id, ratings: rated }}
            name=''>
            <img className={cx('icon')} src={rate} alt={rated[0] > 0 ? 'change rating' : 'rate'}
              title={rated[0] > 0 ? 'change rating' : 'rate'} />
            <div className={cx('b-count')}>{rated[0] == 0 ? '-' : rated[0]}</div>
            <div className={cx('b-text')}>RATE</div>
          </Link>
          <Link
            className={cx('button', 'normal')}
            type='fiction'
            action='donate'
            data={{ id }}
            name=''>
            <img className={cx('icon')} src={donate} alt={"donate"} title={"donate"} />
            <div className={cx('b-text')}>DONATE</div>
          </Link>
          <Link
            className={cx('button', subscribed ? 'active' : '')}
            type='fiction'
            action='subscribe'
            data={{ id }}
            name=''>
            <img className={cx('icon')} src={rate} alt={subscribed ? "cancel subscriptions" : "rate"}
              title={subscribed ? "cancel subscriptions" : "subscribe"} />
            <div className={cx('b-count')}>{subscribers}</div>
            <div className={cx('b-text')}>SUBSCRIBE $5/M</div>
          </Link>
          <Link
            className={cx('button', 'normal')}
            type='fiction'
            action='report'
            data={{ id }}
            name=''>
            <img className={cx('icon')} src={report} alt={"report"} title={"report"} />
            <div className={cx('b-text')}>REPORT</div>
          </Link>
        </div>
      </div>
    );
  }
}

FictionBox.propTypes = {
  authorNote: PropTypes.array,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  categories: PropTypes.array.isRequired,
  tags: PropTypes.string.isRequired,
  authors: PropTypes.array.isRequired,
  createdAt: PropTypes.number.isRequired,
  updatedAt: PropTypes.number,
  chapters: PropTypes.number.isRequired,
  downed: PropTypes.string.isRequired,
  downvotes: PropTypes.number.isRequired,
  favorited: PropTypes.string.isRequired,
  favorites: PropTypes.number.isRequired,
  followed: PropTypes.string.isRequired,
  followers: PropTypes.number.isRequired,
  frequency: PropTypes.number.isRequired,
  pages: PropTypes.number.isRequired,
  popularity: PropTypes.number.isRequired,
  rated: PropTypes.array.isRequired,
  rating: PropTypes.array.isRequired,
  reviewId: PropTypes.string,
  scheduleType: PropTypes.string.isRequired,
  start: PropTypes.string,
  status: PropTypes.string.isRequired,
  subscribed: PropTypes.number.isRequired,
  subscribers: PropTypes.number.isRequired,
  summary: PropTypes.array.isRequired,
  upped: PropTypes.string.isRequired,
  upvotes: PropTypes.number.isRequired,
  views: PropTypes.number.isRequired
};