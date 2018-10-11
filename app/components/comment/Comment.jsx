import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from '../../css/components/comment';
import Link from '../../components/Link';
import TextBox from '../../components/TextBox';

import { toDate } from '../../utils/misc';

import reviews from "../../images/fiction/reviews_w60.png";
import updated from "../../images/fiction/w20/date_w20.png";

import down_g20 from "../../images/fiction/g20/down_g20.png";
import edit_g20 from "../../images/fiction/g20/edit_g20.png";
import reply_g20 from "../../images/fiction/g20/reply_g20.png";
import report_g20 from "../../images/fiction/g20/report_g20.png";
import up_g20 from "../../images/fiction/g20/up_g20.png";

const cx = classNames.bind(styles);

export default class Comment extends PureComponent {
  render() {
    const { id, authorId, author, avatar, date, down, downvotes, edited, origin, quote = '', replyTo,
      score, statId, text, title, type, up, upvotes, userId } = this.props;
    const review = score ? true : false;
    const dateO = new Date(edited ? edited : date);
    const fullDate = toDate(dateO, '');
    const br = `
`;

    const authorO = { id: authorId, name: author };
    let editO = { id };
    const idO = { id };
    const downO = { id, rId: down, type: 'down' };
    const replyO = { origin: origin ? origin : id, replyTo: id, statId };
    const upO = { id, rId: up, type: 'up' };

    if (review) editO = {
      id, length: text.style ? 5 : 1, text: [text.overall ? text.overall.join(br) : ''],
      score: [score.overall, score.style, score.grammar, score.story, score.characters].filter(s => s), title };
    else editO.text = [text.join(br)];
    if (text.story) editO.text = [editO.text[0], text.style.join(br), text.grammar.join(br), text.story.join(br),
      text.characters.join(br)]
    return (
      <li className={cx('comment',
        { review, reply: origin }
      )}>
        <div className={cx('placeholder')}></div>
        <img className={cx('avatar')} src={reviews} alt="author" />
        <div className={cx('details')}>
          <Link
            className={cx('d-text', 'ellipsis')}
            type='user'
            action='profile'
            data={authorO}
            name={authorO.name} />
          <img className={cx('icon')} src={updated} alt="date" title="posted" />
          <div className={cx('d-text', 'ellipsis')}>{fullDate}</div>
        </div>
        {review ?
          <div className={cx('ratings')}>
            <div className={cx('title')}>{title}</div>
            <div className={cx('container')}>
              <div className={cx('header')}>OVERALL: {score.overall}</div>
              <TextBox className={cx('text')} value={text.overall} />
            </div>
            {score.style ?
            <div className={cx('container')}>
              <div className={cx('header')}>STYLE: {score.style}</div>
              <TextBox className={cx('text')} value={text.style ? text.style : ['-']} />
            </div> : ''}
            {score.grammar ?
            <div className={cx('container')}>
              <div className={cx('header')}>GRAMMAR: {score.grammar}</div>
              <TextBox className={cx('text')} value={text.grammar ? text.grammar : ['-']} />
            </div> : ''}
            {score.story ?
            <div className={cx('container')}>
              <div className={cx('header')}>STORY: {score.story}</div>
              <TextBox className={cx('text')} value={text.story ? text.story : ['-']} />
            </div> : ''}
            {score.characters ?
            <div className={cx('container')}>
              <div className={cx('header')}>CHARACTERS: {score.characters}</div>
              <TextBox className={cx('text')} value={text.characters ? text.characters : ['-']} />
            </div> : ''}
          </div>
          : 
          <div className={cx('container')}>
            {replyTo === null  || replyTo === origin ? '' :
              <div className={cx('quote')}>
                <TextBox className={cx('ctext')} value={quote} />
              </div>
            }
            <TextBox className={cx('ctext')} value={text} />
          </div>
        }
        <div className={cx('buttons')}>
          {type !== 'messages' ? <div className={cx('container')}>
            <Link
              className={cx('button')}
              type='comment'
              action={up !== 'none' ? 'up_remove' : 'up' }
              data={upO}
              name=''>
              <img className={cx('icon', up !== 'none' ? 'active' : '')} src={up_g20} alt="up" title="up" />
              <div className={cx('b-text', '')}>{upvotes}</div>
            </Link>
            <Link
              className={cx('button')}
              type='comment'
              action={down !== 'none' ? 'down_remove' : 'down' }
              data={downO}
              name=''>
              <img className={cx('icon', down !== 'none' ? 'active' : '')} src={down_g20} alt="down" title="down" />
              <div className={cx('b-text', '')}>{downvotes}</div>
            </Link>
            <div className={cx('placeholder')}></div>
            {authorId === userId ? <Link
              className={cx('button')}
              type={review ? 'review' : 'comment'}
              action='edit'
              data={editO}
              name=''>
              <img className={cx('icon')} src={edit_g20} alt="edit" title="edit" />
              <div className={cx('b-text', '')}>EDIT</div>
            </Link> : ''}
            <Link
              className={cx('button')}
              type='comment'
              action='reply'
              data={replyO}
              name=''>
              <img className={cx('icon')} src={reply_g20} alt="reply" title="reply" />
              <div className={cx('b-text', '')}>REPLY</div>
            </Link>
            <Link
              className={cx('button')}
              type='comment'
              action='report'
              data={idO}
              name=''>
              <img className={cx('icon')} src={report_g20} alt="report" title="report" />
              <div className={cx('b-text', '')}>REPORT</div>
            </Link>
          </div> : ''}
        </div>
      </li>
    );
  }
}

Comment.propTypes = {
  id: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  avatar: PropTypes.string.isRequired,
  date: PropTypes.number.isRequired,
  down: PropTypes.string.isRequired,
  downvotes: PropTypes.number.isRequired,
  edited: PropTypes.number,
  origin: PropTypes.string,
  quote: PropTypes.array,
  replyTo: PropTypes.string,
  score: PropTypes.object,
  statId: PropTypes.string,
  text: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object
  ]).isRequired,
  title: PropTypes.string,
  type: PropTypes.string.isRequired,
  up: PropTypes.string.isRequired,
  upvotes: PropTypes.number.isRequired,
  userId: PropTypes.string
};
