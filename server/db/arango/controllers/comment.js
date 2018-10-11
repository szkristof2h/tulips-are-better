import db from '../connect';
import { aql } from 'arangojs';
import { INVALID_ID, MAIN_USER, NO_COMMENTS, NO_PARENT_FOR_COMMENT, NOT_REGISTERED, NO_PERMISSION } from './constants';
import {  getAuthors, postAuthors, postParentTo } from './fiction';
import { convert, getStats, handleErrors, postStat, toObject, updateStatCount, validate } from './misc';
import { canEdit, markUpdates, hasPermission, postPermissions, postUpdates } from './user';


export function getComments(req, res, cId, o, pT) {
  const pType = req && req.params.pType ? req.params.pType === 'book' ? 'book' : 'chapter' : pT;
  const collection = req && req.params.id && typeof req.params.id === 'string' && req.params.id.includes('/') ?
    req.params.id.split('/')[0] : 'fictions';
  const id = cId ? cId : convert(req.params.id, `${collection.slice(0, -1)}Id`);
  const type = convert(req && req.params.type ? req.params.type.slice(0, -1) : 'comment', 'commentType');
  const offset = convert(req ? req.params.offset : o, 'int');
  const sortBy = convert('createdAt', 'sortBy');
  const sortOrder = convert('DESC', 'sortOrder');
  const userId = 'users/548986';
  const errors = validate([id, type, offset]);
  let comments = {};
  
  return (errors.length != 0 ? Promise.reject(errors) : db.query(aql`
    LET comments = (
      FOR c, e IN 1 INBOUND ${id} GRAPH 'commentsGraph'
      SORT c[${sortBy}] ${sortOrder}
      FILTER c.type != 'private' && c.type == ${type} && e.main && e.type == ${pType}
      LIMIT ${offset}, 1
      
      LET stats = (
        FOR sT IN statTo
        FILTER sT._to == c._id
          FOR s IN statistics
          FILTER s._id == sT._from
          RETURN { id: sT._from, up: s.up, down: s.down, replyCount: s.replyCount }
      )
      LET author = (
        FOR a IN authorOf
        FILTER c._id == a._to 
          FOR u IN users
          FILTER a._from == u._id
          RETURN { id: u._id, link: u.link, avatar: u.avatar, name: u.displayName }        
      )
      LET rating = (
        FOR r, e2 IN 1 OUTBOUND ${userId} GRAPH 'ratingsGraph'
        FILTER e2._to == c._id
        RETURN { id: c._id, rId: e2._key, type: e2.type }
      )
        
      RETURN { id: c._id, text: c.body, date: c.createdAt, edited: c.updatedAt, authorId: author[0].id,
        rating: rating[0], statId: stats[0].id, author: author[0], up: stats[0].up, down: stats[0].down, type: c.type,
      replyCount: stats[0].replyCount }
    )

    RETURN LENGTH(comments) == 0 ? ${NO_COMMENTS} : { comments, ids: comments[*].id, authors: comments[*].author,
      ratings: comments[*].rating }
    `)).then(data => {
      if (data._result[0] === NO_COMMENTS) {
        comments = { comments: {}, ids: [], authors: {}, ratings: {} };
        return type === 'typos' ? NO_COMMENTS.replace('comments', type) : NO_COMMENTS;
      }        

      data._result[0].comments.map((c, i) => delete data._result[0].comments[i]['author']);
      data._result[0].comments.map((c, i) => delete data._result[0].comments[i]['rating']);
      data._result[0].ratings = data._result[0].ratings.filter(r => r !== null);

      comments = {
        comments: toObject(data._result[0].comments, 'id'),
        ids: data._result[0].ids,
        authors: toObject(data._result[0].authors, 'id'),
        ratings: {}
      };

      if (res !== null) comments.fiction = id;

      data._result[0].ratings.forEach(c => comments.ratings[c.id] = { [c.type]: c.rId });
      return getReplies(null, null, comments.ids, 0, userId);
    }).then(data => {
      if (data !== NO_COMMENTS) {
        comments.comments = { ...comments.comments, ...data.comments };
        comments.replyIds = data.ids;
        comments.replies = data.replies;
        comments.users = { ...comments.users, ...data.users };
        comments.ratings = { ...comments.ratings, ...data.ratings };
      } else {
        comments.replies = {};
      }
      comments.type = type + 's';// for editor

      return res !== null ? res.status(200).json(comments) : comments;
    }).catch(err => res !== null ? res.status(500).json(handleErrors('GET_COMMENTS_ERROR: ', err)) :
      handleErrors('GET_COMMENTS_ERROR: ', err));
}

export function getReplies(req, res, cId, o, uId) {
  const mainType = req ? req.params.id.includes('comments/') ? 'comment' : 'review' : cId[0].includes('comments/') ?
    'comment' : 'review';
  const ids = convert(req ? [req.params.id] : cId, `${mainType}Ids`);
  const offset = convert(req ? req.params.offset : o, 'int');
  const sortBy = convert('createdAt', 'sortBy');
  const sortOrder = convert('ASC', 'sortOrder');
  const userId = 'users/548986' ;
  const errors = validate([ids, offset]);
  let comments = {};
  
  return (errors.length != 0 ? Promise.reject(errors) : db.query(aql`
    LET comments = (
      FOR t IN ${ids}
        FOR c, e IN 1 INBOUND t GRAPH 'repliesGraph'
        FILTER e.origin == true
        SORT c[${sortBy}] ${sortOrder}
        LIMIT ${offset}, ${o !== undefined ? 1 : 5}
        
        LET stats = (
          FOR sT IN statTo
          FILTER sT._to == c._id
            FOR s IN statistics
            FILTER s._id == sT._from
            RETURN { statId: sT._from, up: s.up, down: s.down }
        )
        LET author = (
          FOR a IN authorOf
          FILTER c._id == a._to 
            FOR u IN users
            FILTER a._from == u._id
            RETURN { id: u._id, link: u.link, avatar: u.avatar, name: u.displayName }
        )
        LET replyTo = (
          FOR r, e2 IN 1 OUTBOUND c._id GRAPH 'repliesGraph'
          FILTER e2.origin == false
          RETURN e2._to
        )
        LET rating = (
          FOR r, e3 IN 1 OUTBOUND ${userId} GRAPH 'ratingsGraph'
          FILTER e3._to == c._id
          RETURN { id: c._id, rId: e3._key, type: e3.type }
        )
        
        RETURN { id: c._id, text: c.body, date: c.createdAt, edited: c.updatedAt, authorId: author[0].id,
          origin: t, rating: rating[0], replyTo: replyTo[0], statId: stats[0].id, author: author[0], up: stats[0].up,
          type: c.type, down: stats[0].down, replies: { to: t, from: c._id } }
    )

    RETURN LENGTH(comments) == 0 ? ${NO_COMMENTS} : { comments, ids: comments[*].id, authors: comments[*].author,
      replies: comments[*].replies, ratings: comments[*].rating }
    `)).then(data => {
      let replies = {};
      if(data._result[0] === NO_COMMENTS) return Promise.reject(NO_COMMENTS);

      data._result[0].replies.forEach(r => {
        replies[r.to] ?
          replies[r.to] = [...replies[r.to], r.from] : replies[r.to] = [r.from];
      });

      data._result[0].comments.map((c, i) => delete data._result[0].comments[i]['author']);
      data._result[0].comments.map((c, i) => delete data._result[0].comments[i]['replies']);
      data._result[0].comments.map((c, i) => delete data._result[0].comments[i]['rating']);
      data._result[0].ratings = data._result[0].ratings.filter(r => r !== null);

      comments = {
        comments: toObject(data._result[0].comments, 'id'),
        ids: data._result[0].ids,
        users: toObject(data._result[0].authors, 'id'),
        ratings: {},
        replies: replies
      };

      if (res !== null) comments.origin = ids[0];
      data._result[0].ratings.forEach(r => comments.ratings[r.id] = { [r.type]: r.rId });
      return res !== null ? res.status(200).json(comments) : comments;
    })
    .catch(err => res !== null ? res.status(500).json(handleErrors('GET_REPLIES_ERROR: ', err)) :
      handleErrors('GET_REPLIES_ERROR: ', err));
}


// POST ------------------------------------------------------------------------

export function postComment(req, res){
  // todo: check if parent's not a rating-only review
  const userId = MAIN_USER;
  const body = convert(req.body.body, 'richText');
  const review = req.body.origin && req.body.origin.includes('reviews') ? 'review' : 'comment';
  const origin = req.body.origin ? convert(req.body.origin, `${review}Id`) : null;
  const collection = !req.body.parentId ? { error: 'Missing parentId.' } : req.body.parentId.includes('articles') ?
    'article' : req.body.parentId.includes('fictions') ? 'fiction' : { error: 'Invalid type' };
  const parentId = typeof collection === 'string' ? convert(req.body.parentId, `${collection}Id`) : '';
  const replyTo = req.body.replyTo ? convert(req.body.replyTo, `${req.body.replyTo.includes('comments') ? 'comment' : 'review'}Id`) : null;
  const type = convert(req.body.type, 'commentType');
  const errors = validate([body, origin, parentId, replyTo]);
  const pType = collection === 'fiction' ? 'book' : 'chapter';
  let comment = {};
  let statId;
  let newId;
  let statType;
  
  return (errors.length != 0 ? Promise.reject(errors) : hasPermission(userId, [parentId]))
    .then(p => {
      if (p.length == 0 || !p[0].includes(parentId.split('/')[0])) return Promise.reject(p);

      return db.query(aql`LET p = DOCUMENT(${parentId}) RETURN p.type`);
    }).then(r => {
      if (r._result[0] != 'book' && r._result[0] != 'chapter') return Promise.reject('Can\'t comment it!');
      comment = {
        createdAt: convert(null, 'dateNow'),
        body,
        type
      };

      return db.query(aql`INSERT ${comment} IN comments RETURN NEW`);
    }).then(r => { // save authors
      newId = r._result[0]._id;
      statType = type === 'typo' ? 'typoCount' : 'commentCount';
      return postAuthors([{ id: userId, positions: ['author'] }], newId, userId);
    })
    .then(() => review === 'review' ? false : db.query(aql`INSERT { _from: ${newId}, _to: ${parentId},
      main: ${!replyTo}, type: ${pType} } IN commentTo RETURN true`))
    .then(() => review === 'review' || pType !== 'chapter' ? false : db.query(aql`
      LET parent = (FOR p IN 2 INBOUND ${parentId} GRAPH 'parentsGraph' RETURN p._id)
      INSERT { _from: ${newId}, _to: parent[0], main: ${!replyTo}, type: 'chapter' } IN commentTo RETURN true`))
    .then(() => origin && replyTo ? db.query(aql`INSERT { _from: ${newId}, _to: ${origin}, origin: true } IN replyTo
      RETURN true`) : '')
    .then(() => origin && replyTo ? db.query(aql`INSERT { _from: ${newId}, _to: ${replyTo}, origin: false } IN replyTo
      RETURN true`) : '')
    .then(() => postStat(newId, 'comment'))
    .then(r => { statId = r._result[0]; return review === 'review' ? false : 
      updateStatCount(parentId, statType, 1, userId, null); })
    .then(() => !origin && !replyTo && statType === 'commentCount' ? updateStatCount(parentId, 'mainCommentCount', 1, userId, null) : '')
    .then(() => updateStatCount(userId, statType, 1, userId, null))
    .then(() => origin ? updateStatCount(origin, 'replyCount', 1, userId, null) : '')
    .then(() => replyTo && replyTo !== origin ? updateStatCount(replyTo, 'replyCount', 1, userId, null) : '')
    .then(() => db.query(aql`LET u = DOCUMENT(${userId}) RETURN { id: u._id, link: u.link, avatar: u.avatar,
      name: u.displayName }`))
    .then(r => {
      comment = {
        comments: {
          [newId]: {
            authorId: userId, date: comment.createdAt, down: 0, id: newId, origin, replyCount: 0, replyTo, statId,
            text: body, type, up: 0 }
        },
        id: newId,
        ids: [newId],
        origin,
        replyTo,
        stats: { [statId]: { down: 0, id: statId, replyCount: 0, up: 0 } },
        statType: statType === 'typoCount' || (replyTo && statType === 'commentCount') ? statType : 'mainCommentCount',
        users: { [userId]: r._result[0] },
        value: 1
      };
      
      res.status(200).json(comment)
    })
    .catch(err => res.status(500).json(handleErrors('POST_COMMENT_ERROR: ', err)));
}

// export function postMessage(message, userId) {}


// UPDATE ----------------------------------------------------------------------

export function updateComment(req, res){
  const userId = MAIN_USER;
  const id = convert(req.body.id, 'commentId');
  const body = convert(req.body.body, 'richText');
  const errors = validate([id, body]);

  return (errors.length != 0 ? Promise.reject(errors) : Promise.resolve(''))
    .then(() => db.query(aql`FOR c IN INBOUND SHORTEST_PATH ${id} TO ${userId} GRAPH 'authorsGraph' RETURN c._id`))
    .then(r => {
      if (r._result.length === 0) Promise.reject(NO_PERMISSION);

      const comment = {
        updatedAt: convert(null, 'dateNow'),
        title: convert(req.body.title, 'title'),
        body: convert(req.body.body, 'richText')
      };

      db.query(aql`UPDATE ${id.replace('comments/', '')} WITH ${comment} IN comments RETURN true`)
    })
    .then(() => res.status(200).json({id, text: body}))
    .catch(err => handleErrors('UPDATE_COMMENT_ERROR: ', err));
}


// REMOVE ----------------------------------------------------------------------



export default {
  getComments,
  getReplies,
  postComment,
  updateComment
}