import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import styles from '../css/components/comments';

import Comment from '../components/comment/Comment';
import Editor from '../components/Editor';
import Link from '../components/Link';
import SubmitButton from '../components/SubmitButton';
import SubmitTextInput from '../components/SubmitTextInput';
import { pasting, typing } from '../actions/editor';

import add_w40 from "../images/add_w40.png";
import delete_w40 from "../images/delete_w40.png";
import comments_f from "../images/fiction/comments_w60.png";
import reviews from "../images/fiction/reviews_w60.png";
import typos from "../images/fiction/edit_w60.png";

const cx = classNames.bind(styles);

class Comments extends Component {
  render() {
    const { commentsById, comments, fictionId, formatting, hasReview, isPasting, pasting, preview, ratings, replies,
      stats, tab, texts, title, type, typing, usersById, userId, values } = this.props;
      
    const count = comments.length != 0 ? type === 'reviews' ? stats.reviewCount : type === 'comments' ? stats.mainCommentCount : stats.typoCount
       : 0;
    const commentsO = { id: fictionId, offset: 0, tab };
    const replyTo = values.replyTo;
    const reviewsO = { id: fictionId, offset: 0 };
    const style = tab !== 'fiction' ? { gridColumn: '1 / span 1' } : {};
    const types = ['overall', 'style', 'grammar', 'story', 'characters'];
    const typosO = { id: fictionId, offset: 0, tab };
    const editingType = !values.id ? 'none' : values.id.includes('reviews/') ? 'review' : 'comment';
    let submission = {
      type: replyTo || editingType === 'comment' ? 'comment' : type.slice(0, -1),
      body: texts[0] ? texts[0].split(/(?:\r\n|\r|\n)/g) : { error: `You can't submit an empty ${replyTo ? 'comment' : 
        type.slice(0, -1)}` },
      edit: values.edit,
      parentId: fictionId
    };

    if (!values.edit) submission = { ...submission, origin: values.origin, replyTo }
    else submission.id = values.id
    
    if (!replyTo && type === 'reviews' && (!hasReview || (values.edit && editingType === 'review'))) submission = { ...submission,
      rating: false,
      title: title ? title : { error: 'Your review should have a title!' },
      ratings: values.ratings.filter(r => r != 0).length != 5 ? values.ratings.filter(r => r != 0).length == 1 ?
        values.ratings.filter(r => r != 0) :
      { error: 'You either leave a simple review (only giving an overall score) or a detailed one: rating all 5 scores' }
      : values.ratings,
      style: texts.length > 1 ? texts[1] ? texts[1].split(/(?:\r\n|\r|\n)/g) :
        { error: `The style part of the review is empty!` } : '',
      grammar: texts.length > 1 ? texts[2] ? texts[2].split(/(?:\r\n|\r|\n)/g) :
        { error: `The grammar part of the review is empty!` } : '',
      story: texts.length > 1 ? texts[3] ? texts[3].split(/(?:\r\n|\r|\n)/g) :
        { error: `The story part of the review is empty!` } : '',
      characters: texts.length > 1 ? texts[4] ? texts[4].split(/(?:\r\n|\r|\n)/g) :
        { error: `The characters part of the review is empty!` } : ''
    }

    let errors = [];
    let hint = false;

    Object.keys(submission).forEach(k => {
      const hasError = typeof submission[k] === 'object' && submission[k] && submission[k].error;

      if (hasError) {
        if (types.includes(k)) hint = true;
        errors.push(submission[k].error);
      }
    });

    hint && errors.push(`You can rate the fiction without leaving a review if you scroll a bit up and click
      on the rate button`);

    return (
      <div className={cx('container')} style={style}>
        <div className={cx('extra', { three: tab === 'dashboard' })}>
          <Link
            className={cx('container')}
            type='fiction'
            action='comments'
            data={commentsO}
            name=''>
            <img className={cx('icon')} src={comments_f} alt="info" />
            <div className={cx('title')}>COMMENTS ({stats.mainCommentCount})</div>
          </Link>
          {fictionId.includes('fictions/') ? <Link
            className={cx('container')}
            type='fiction'
            action='reviews'
            data={reviewsO}
            name=''>
            <img className={cx('icon')} src={reviews} alt="author" />
            <div className={cx('title')}>REVIEWS ({stats.reviewCount})</div>
          </Link> : ''}
          {tab === 'dashboard' || fictionId.includes('articles/') ? <Link
            className={cx('container')}
            type='fiction'
            action='typos'
            data={typosO}
            name=''>
            <img className={cx('icon')} src={typos} alt="author" />
            <div className={cx('title')}>TYPOS ({stats.typoCount})</div>
          </Link> : ''}
        </div>
        <div className={cx('comments')}>
          {tab !== 'dashboard' && type === 'reviews' && (!replyTo && !hasReview || (values.edit && editingType === 'review')) ?
            <div className={cx('title-container')}>
              <SubmitTextInput
                className={cx('title')}
                index={0}
                placeholder='Give your review a title...'
                type='editor-title'
                value={title}
                onEntryChange={typing} /> 
              </div> : '' }
          {tab !== 'dashboard' && (replyTo || type !== 'reviews' || !hasReview || values.edit) ?
            <Editor
              formatting={formatting[0]}
              index={0}
              isPasting={isPasting}
              pasting={pasting}
              placeholder={`Write a ${replyTo ? 'comment' : type.slice(0, -1)}...`}
              preview={preview[0]}
              type='comment-editor'
              typing={typing}
              value={texts[0]}
            /> : ''}
          {tab === 'dashboard' || replyTo || type !== 'reviews' || (hasReview && !values.edit) || (values.edit && editingType !== 'review') ? '' :
            <div className={cx('header')}>
              <div className={cx('d-text')}>OVERALL</div>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => <Link
                key={'oR' + r}
                className={cx('d-num', { active: values.ratings[0] == r })}
                type='editor'
                action='review_rating'
                data={{ rating: r, index: 0 }}
                name={r + ''} />)}
            </div>
          }
          {tab === 'dashboard' || replyTo || type !== 'reviews' || (hasReview && !values.edit) || (values.edit && editingType !== 'review') ? '' :
            <Link
              className={cx('load-button')}
              type='editor'
              action='load_more_review'
              data={{ }}
              name=''>
              <img className={cx('icon')} alt="add" title="add" src={add_w40} />
              <div className={cx('b-text')}>WRITE A DETAILED REVIEW</div>
            </Link>
          }
          {replyTo || (hasReview && !values.edit) || (values.edit && editingType !== 'review') ? '' : type !== 'reviews' || texts.length == 1 ? '' :
            [1, 'style', 2, 'grammar', 3, 'story', 4, 'characters'].map((t, i) =>
              typeof t == 'string' ?
                <div className={cx('header')} key={`rTH${t}`}>
                  <div className={cx('d-text')}>{t.toUpperCase()}</div>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => <Link
                    key={`rTH${t}${r}`}
                    className={cx('d-num', { active: values.ratings[types.indexOf(t)] == r })}
                    type='editor'
                    action='review_rating'
                    data={{ rating: r, index: types.indexOf(t) }}
                    name={r + ''} />)}
                </div> 
              :
              <Editor
                key={`rTE${t}`}
                formatting={formatting[0]}
                hide={true}
                index={t}
                isPasting={isPasting}
                pasting={pasting}
                placeholder={`Write something about its ${types[t]}...`}
                preview={preview[0]}
                type='comment-editor'
                typing={typing}
                value={texts[t]} />
            )
          }
          {tab !== 'dashboard' && replyTo ?
            <div className={cx('replyTo')}>
              <div className={cx('b-text')}>Currently replying to:</div>
              <div className={cx('b-text')}>
                {usersById[commentsById[replyTo].authorId].name}
              </div>
              <Link
                className={cx('button')}
                type='editor'
                action={'remove_title'}
                data={submission}
                name=''>
                <img className={cx('icon')} alt="add" title="add" src={delete_w40} />
              </Link>
            </div> : ''}
          {tab !== 'dashboard' && (replyTo || !hasReview || values.edit || type !== 'reviews') ?
            <SubmitButton errors={errors} submission={submission} type={replyTo || editingType === 'comment' ? 'comment' : type.slice(0, -1)} /> 
          : ''}
          <ul className={cx('list')}>
            {comments && comments.length != 0 ? comments.map(c =>
              <li className={cx('container')} key={`cCon${c}`}>
                <ul className={cx('list')} key={`cLi${c}`}>
                  <Comment
                    key={`cC${c}`}
                    id={c}
                    author={usersById[commentsById[c].authorId].name}
                    authorId={commentsById[c].authorId}
                    avatar={usersById[commentsById[c].authorId].avatar}
                    date={commentsById[c].date}
                    down={ratings[c] && ratings[c].down ? ratings[c].down : 'none'}
                    downvotes={commentsById[c].down}
                    edited={commentsById[c].edited}
                    link={usersById[commentsById[c].authorId].link}
                    origin={null}
                    replies={replies[c] ? replies[c].length : 0}
                    replyTo={null}
                    score={commentsById[c].score}
                    statId={commentsById[c].statId}
                    text={commentsById[c].text}
                    title={commentsById[c].title}
                    type={commentsById[c].type}
                    up={ratings[c] && ratings[c].up ? ratings[c].up : 'none'}
                    upvotes={commentsById[c].up}
                    userId={userId}
                    />
                    {
                    replies[c] && replies[c].map(r =>
                      <Comment
                        key={`rC${r}`}
                        id={r}
                        author={usersById[commentsById[r].authorId]['name']}
                        authorId={commentsById[r].authorId}
                        avatar={usersById[commentsById[r].authorId].avatar}
                        date={commentsById[r].date}
                        down={ratings[r] && ratings[r].down ? ratings[r].down : 'none'}
                        downvotes={commentsById[r].down}
                        edited={commentsById[r].edited}
                        link={usersById[commentsById[r].authorId].link}
                        origin={commentsById[r].origin}
                        quote={type !== 'reviews' || commentsById[r].replyTo !== c ? commentsById[commentsById[r].replyTo].text : null}
                        replyTo={commentsById[r].replyTo}
                        statId={commentsById[c].statId}
                        text={commentsById[r].text}
                        type={commentsById[r].type}
                        up={ratings[r] && ratings[r].up ? ratings[r].up : 'none'}
                        upvotes={commentsById[r].up}
                        userId={userId}
                      />)
                    }
                  {replies[c] && replies[c].length !== commentsById[c].replyCount && 
                    <Link
                      className={cx('expand')}
                      type='comment'
                      action='replies'
                      data={{ id: c, offset: replies[c].length }}
                      name={`Load replies (${commentsById[c].replyCount - replies[c].length})`} />
                  }
                </ul>
              </li>
            ) : <li className={cx('info')}>There are no {type}!</li>}
            {comments && comments.length !== count &&
              <li>
                <Link
                  className={cx('expand')}
                  type={type.slice(0, -1)}
                  action={type}
                  data={{ id: fictionId, offset: comments.length, tab }}
                  name={`Load ${type.slice(0, -1)} (${count - comments.length})`} />
              </li>
            }
          </ul>
        </div>
      </div>
    );
  }
}

Comments.propTypes = {
  comments: PropTypes.array.isRequired,
  commentsById: PropTypes.object.isRequired,
  commentCount: PropTypes.number,
  fictionId: PropTypes.string.isRequired,
  formatting: PropTypes.array,
  hasReview: PropTypes.bool.isRequired,
  isPasting: PropTypes.bool,
  preview: PropTypes.array,
  replies: PropTypes.object.isRequired,
  reviewCount: PropTypes.number,
  stats: PropTypes.object.isRequired,
  tab: PropTypes.string.isRequired,
  texts: PropTypes.array,
  title: PropTypes.string,
  type: PropTypes.string,
  userId: PropTypes.string,
  values: PropTypes.object
};

function mapStateToProps(state) {
  const type = state.fiction.activeFiction.includes('fictions/') ? 'fictionsById' : 'chaptersById'
  return {
    commentsById: state.comment.commentsById,
    comments: state.fiction[type][state.fiction.activeFiction].commentIds,
    fictionId: state.fiction.activeFiction,
    formatting: state.editor.settings.formatting,
    hasReview: Object.keys(state.fiction.ownReview).length != 0 ? true : false,
    indexes: state.editor.indexes,
    isPasting: state.editor.settings.isPasting,
    preview: state.editor.settings.preview,
    ratings: state.rating.ratings,
    replies: state.comment.replies,
    stats: state.statistics.statisticsById[state.fiction[type][state.fiction.activeFiction].statId],
    tab: state.comment.tab,
    texts: state.editor.texts,
    title: state.editor.title,
    type: state.editor.type,
    usersById: state.user.usersById,
    userId: state.user.currentUser.id,
    values: state.editor.values,
  };
}

export default connect(mapStateToProps, { pasting, typing })(Comments);