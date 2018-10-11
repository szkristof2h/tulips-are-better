import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import requiredIf from 'react-required-if';
import ChapterNavigation from '../components/ChapterNavigation';
import Comments from './Comments';
import Link from '../components/Link';
import TextBox from '../components/TextBox';
import { apiEndpoint as site } from '../../config/app';

import classNames from 'classnames/bind';
import styles from '../css/components/chapter';

import { toDate } from '../utils/misc';

import logo from "../images/logo.png";
import facebook from "../images/social/facebook_w50.png";
import twitter from "../images/social/twitter_w50.png";
import reddit from "../images/social/reddit_w50.png";
import pinterest from "../images/social/pinterest_w50.png";
import email from "../images/social/email_w50.png";

import author_w20 from "../images/fiction/w20/author_w20.png";
import donate_w20 from "../images/fiction/w20/donate_w20.png";
import info_w20 from "../images/fiction/w20/info_w20.png";
import updated from "../images/fiction/w20/date_w20.png";

import down from "../images/fiction/down_w60.png";
import favorite from "../images/fiction/favorite_w60.png";
import report from "../images/fiction/report_w60.png";
import up from "../images/fiction/up_w60.png";


const cx = classNames.bind(styles);

class Chapter extends Component {
  render() {
    const { activeFiction, chapter, isFetching, ratings, statistics, users } = this.props;

    if (isFetching !== 'chapter_loaded') return <div>LOADING...</div>;

    const id = activeFiction;
    const downed = ratings.down ? ratings.down : 'none';
    const link = 
      `${site}/${chapter.parents[1].title}/chapter/${chapter.num}/${id.replace('articles/', '')}`;
    const next = chapter.next ? chapter.next.id.replace('articles/', '') : 'none';
    const previous = chapter.previous ? chapter.previous.id.replace('articles/', '') : 'none';
    const thanked = ratings.thanks ? ratings.thanks : 'none';
    const title = `${chapter.parents[1].title} - Chapter ${chapter.num}`;
    const upped = ratings.up ? ratings.up : 'none';
    return (
      <div className={cx('main')}>
        <img className={cx('logo')} src={logo} />
        <ChapterNavigation
          book={chapter.parents[1].title}
          id={chapter.parents[1].id}
          next={next}
          num={chapter.num}
          previous={previous} />
        <div className={cx('article')}>
          <div className={cx('chapter')}>
            {`Chapter ${chapter.num} - ${chapter.title}`}
          </div>
          <div className={cx('volume')}>
            {`Volume ${chapter.volNum} - ${chapter.parents[0].title}`}
          </div>
          {chapter.authorNote && <div className={cx('header')}>
            Author's Note
          </div>}
          {chapter.authorNote && <TextBox className={cx('note', 'before')} value={chapter.authorNote} />}
          <TextBox className={cx('text')} value={chapter.body} />
          {chapter.afterNote && <div className={cx('header', 'after')}>
            Author's After Note
          </div>}
          {chapter.afterNote && <TextBox className={cx('note', 'after')} value={chapter.afterNote} />}
        </div>
        <div className={cx('buttons')}>
          <div className={cx('button', { active: upped !== 'none' })}>
            <Link
              className={cx('b-text')}
              type='chapter'
              action={upped === 'none' ? 'up' : 'up_remove'}
              data={{ id, rId: upped, type: 'up' }}
              name=''>
              <img className={cx('icon')} alt="upvote" title="upvote" src={up} /></Link>
            <Link
              className={cx('b-text')}
              type='chapter'
              action={upped === 'none' ? 'up' : 'up_remove'}
              data={{ id, rId: upped, type: 'up' }}
              name=''>{statistics.up}<br />UPVOTE</Link>
          </div>
          <div className={cx('button', { active: downed !== 'none' })}>
            <Link
              className={cx('b-text')}
              type='chapter'
              action={downed === 'none' ? 'down' : 'down_remove'}
              data={{ id, rId: downed, type: 'down' }}
              name=''>
              <img className={cx('icon')} alt="downvote" title="downvote" src={down} /></Link>
            <Link
              className={cx('b-text')}
              type='chapter'
              action={downed === 'none' ? 'down' : 'down_remove'}
              data={{ id, rId: downed, type: 'down' }}
              name=''>{statistics.down}<br />DOWNVOTE</Link>
          </div>
          <div className={cx('button', { active: thanked !== 'none' })}>
            <Link
              className={cx('b-text')}
              type='chapter'
              action={thanked === 'none' ? 'thanks' : 'thanks_remove'}
              data={{ id, rId: thanked, type: 'thanks' }}
              name=''>
              <img className={cx('icon')} alt="thanks" title="thanks" src={favorite} /></Link>
            <Link
              className={cx('b-text')}
              type='chapter'
              action={thanked === 'none' ? 'thanks' : 'thanks_remove'}
              data={{ id, rId: thanked, type: 'thanks' }}
              name=''>{statistics.thanks}<br />THANKS!</Link>
          </div>
          <div className={cx('button')}>
            <Link
              className={cx('b-text')}
              type='chapter'
              action='report'
              data={{ id }}
              name=''>
              <img className={cx('icon')} alt="report" title="report" src={report} />
            </Link>
            <Link
              className={cx('b-text')}
              type='chapter'
              action='report'
              data={{ id }}
              name='' />
          </div>
        </div>
        <div className={cx('details')}>
          <img className={cx('icon')} alt="next" title="next" src={author_w20} />
          <div className={cx('d-text', 'ellipsis')}>
          {chapter.authorIds.map((a, i) =>
            <Link
              key={`chA${a}${i}`}
              className={cx('')}
              type='user'
              action='profile'
              data={{ id: a, name: users[a].name }}
              name={`${i != 0 ? ',' : ''} ${users[a].name} (${chapter.positions[i].join(', ')})`} />
          )}
          </div>
          <Link
            className={cx('plus')}
            type='fiction'
            action='authors'
            data={{ id: activeFiction, name: 'sdasd' }}
            name='+' />
          {chapter.sponsors && <img className={cx('icon')} alt="sponsored by" title="sponsored by" src={donate_w20} />}
          {chapter.sponsors && <div className={cx('d-text', 'ellipsis')}></div>}
          {chapter.sponsors && <Link
            className={cx('plus')}
            type='fiction'
            action='sponsors'
            data={{ id: activeFiction }}
            name='+' />}
          <img className={cx('icon')} alt="next" title="next" src={info_w20} />
          <div className={cx('d-text', 'universe', 'ellipsis')}>
            {chapter.parents.length > 3 && <Link
              className={cx('plus')}
              type='fiction'
              action='universe'
              data={{ id: chapter.parents[3].id, title: chapter.parents[3].title }}
              name={chapter.parents[3].title} />}{chapter.parents.length > 3 && '>'}
            {chapter.parents.length > 2 && <Link
              className={cx('plus')}
              type='fiction'
              action='series'
              data={{ id: chapter.parents[2].id, title: chapter.parents[2].title }}
              name={chapter.parents[2].title} />}{chapter.parents.length > 2 && '>'}
            <Link
              className={cx('plus')}
              type='fiction'
              action='fiction'
              data={{ id: chapter.parents[1].id, title: chapter.parents[1].title }}
              name={chapter.parents[1].title} />
          </div>
          <Link
            className={cx('plus')}
            type='fiction'
            action='authors'
            data={{ id: activeFiction, name: '' }}
            name='' />
        </div>
        <div className={cx('details')}>
          <img className={cx('icon')} alt="posted on" title="posted on" src={updated} />
          <div className={cx('d-text', 'ellipsis')}>{toDate(chapter.createdAt, 'full')}</div>
          <Link
            className={cx('plus')}
            type='fiction'
            action='authors'
            data={{ id: 'universe', name: '' }}
            name='' />
          <img className={cx('icon')} alt="updated on" title="updated on" src={updated} />
          <div className={cx('d-text', 'ellipsis')}>{chapter.updatedAt ? toDate(chapter.updatedAt, 'full') : '-'}</div>
          <Link
            className={cx('plus')}
            type='fiction'
            action='authors'
            data={{ id: 'universe', name: '' }}
            name='' />
        </div>
        <div className={cx('sharebox')}>
          <div className={cx('button', 'facebook')}>
            <a className={cx('icon')} href={`http://www.facebook.com/sharer.php?u=${link}[title]=${title}`}
              target="_blank">
              <img className={cx('')} alt="share" title="share" src={facebook} />
            </a>
            <a className={cx('b-text')} href={`http://www.facebook.com/sharer.php?u=${link}[title]=${title}`}
              target="_blank">
              SHARE
            </a>
          </div>
          <div className={cx('button', 'twitter')}>
            <a className={cx('icon')} href={`https://twitter.com/share?url=${link}`} target="_blank">
              <img className={cx('')} alt="twitter" title="twitter" src={twitter} />
            </a>

            <a className={cx('b-text')} href={`https://twitter.com/share?url=${link}`} target="_blank">TWEET</a>
          </div>
          <div className={cx('button', 'reddit')}>
            <a className={cx('icon')} href={`http://reddit.com/submit?url=${link}&title=${title}`} target="_blank">
              <img className={cx('')} alt="reddit" title="reddit" src={reddit} />
            </a>
            <a className={cx('b-text')} href={`http://reddit.com/submit?url=${link}&title=${title}`} target="_blank">
              POST
            </a>
          </div>
          <div className={cx('button', 'pinterest')}>
            <a className={cx('icon')} href={`http://pinterest.com/pin/create/button/?url=${link}`} target="_blank">
              <img className={cx('')} alt="pinterest" title="pinterest" src={pinterest} />
            </a>
            <a className={cx('b-text')} href={`http://pinterest.com/pin/create/button/?url=${link}`} target="_blank">
              PIN
            </a>
          </div>
          <div className={cx('button', 'email')}>
            <a className={cx('icon')} href={`mailto:?Subject=${title};Body=${link}`}>
              <img className={cx('')} alt="email" title="email" src={email} />
            </a>
            <a className={cx('icon')} href={`mailto:?Subject=${title};Body=${link}`}>
              EMAIL
            </a>
          </div>
        </div>
        <ChapterNavigation
          book={chapter.parents[1].title}
          id={chapter.parents[1].id}
          next={next}
          num={chapter.num}
          previous={previous} />
        <Comments />
      </div>
    );
  }
}

Chapter.propTypes = {
  activeFiction: requiredIf(PropTypes.string, props => props.isFetching === 'chapter_loaded'),
  chapter: requiredIf(PropTypes.object, props => props.isFetching === 'chapter_loaded'),
  currentUser: requiredIf(PropTypes.string, props => props.isFetching === 'chapter_loaded'),
  isFetching: PropTypes.string.isRequired,
  ratings: PropTypes.object,
  statistics: requiredIf(PropTypes.object, props => props.isFetching === 'chapter_loaded'),
  users: requiredIf(PropTypes.object, props => props.isFetching === 'chapter_loaded')
};

function mapStateToProps(state) {
  return state.fiction.isFetching !== 'chapter_loaded' ? { isFetching: state.fiction.isFetching } : {
    activeFiction: state.fiction.activeFiction,
    chapter: state.fiction.chaptersById[state.fiction.activeFiction],
    currentUser: state.user.currentUser.id,
    isFetching: state.fiction.isFetching,
    ratings: state.rating.ratings[state.fiction.activeFiction],
    statistics: state.statistics.statisticsById[state.fiction.chaptersById[state.fiction.activeFiction].statId],
    users: state.user.usersById
  };
}

export default connect(mapStateToProps, {})(Chapter);