import db from '../connect';
import { aql } from 'arangojs';
import {
  ALREADY_RATED, CANNOT_EDIT, CONVERSATION_NOT_FOUND, MAIN_USER, NO_COMMENTS, NO_CONVERSATION_FOUND,
  NO_PARENT_FOR_CONVERSATION, NO_PARTICIPANTS, NO_PERMISSION, NOT_REGISTERED, PUBLIC_ID
} from './constants';
import { postMessage } from './comment';
import { convert, handleErrors, toObject, updateStatCount, validate } from './misc';


// GET -------------------------------------------------------------------------

export function getConversation(req, res){
  const id = convert(req.params.id, 'conversationId');
  const offset = convert(req.params.offset, 'offset');
  const userId = MAIN_USER;
  let comments = { comment: {}, users: {} };
  const errors = validate([id, offset]);

  return (errors.length != 0 ? Promise.reject(errors) : db.query(aql`FOR v, e IN OUTBOUND SHORTEST_PATH ${userId}
    TO ${id} GRAPH 'pmsGraph' RETURN e._id`))
  .then(r => r._result.length == 0 ? Promise.reject(NO_CONVERSATION_FOUND) : db.query(aql`
    LET con = DOCUMENT(${id})
    LET comments = (
      FOR c IN 1 INBOUND ${id} GRAPH 'messagesGraph'
      SORT c.createdAt DESC
      LIMIT ${offset}, 1
      
      LET author = (
        FOR a IN authorOf
        FILTER c._id == a._to 
          FOR u IN users
          FILTER a._from == u._id
          RETURN { id: u._id, link: u.link, avatar: u.avatar, name: u.displayName }        
      )
        
      RETURN { id: c._id, text: c.body, date: c.createdAt, edited: c.updatedAt, level: 0,
        messageCount: c.messageCount, authorId: author[0].id, author: author[0], type: c.type }
    )

    RETURN LENGTH(comments) == 0 ? ${NO_COMMENTS} : { conversation: { [${id}]: { id: con._id, createdAt: con.createdAt,
      ids: comments[*].id, messageCount: con.messageCount } }, comments, authors: comments[*].author }`))
  .then(r => {
    if (r._result[0] === NO_COMMENTS) return Promise.reject(NO_COMMENTS);

    r._result[0].comments.map((c, i) => delete r._result[0].comments[i]['author']);

    r._result[0] !== NO_COMMENTS &&
      (comments = {
        comments: toObject(r._result[0].comments, 'id'),
        conversations: r._result[0].conversation,
        id: [id],
        users: toObject(r._result[0].authors.filter(a => a != null), 'id')
      });

    return res.status(200).json(comments);
  }).catch(err => res.status(500).json(handleErrors('GET_CONVERSATION_ERROR: ', err)));
}

export function getConversations(req, res) {
  const userId = MAIN_USER;
  const offset = req.params.hasOwnProperty('offset') ? convert(req.params.offset, 'int') : 0;
  const filter = req.params.hasOwnProperty('type') ? convert(req.params.type, 'conversationType') : 'inbox';
  const errors = validate([offset, filter]);
  let conversations = { conversations: {}, ids: [], filter: '', statId: '', stats: {}, users: {} };

  return (errors.length != 0 ? Promise.reject(errors) : db.query(aql`
    LET c = (FOR v, e IN 1 OUTBOUND ${userId} GRAPH 'pmsGraph'
      SORT v.updatedAt DESC
      FILTER !e.deleted
      FILTER ${filter} == 'trashed' ? e.trashed : !e.trashed
      FILTER ${filter} == 'starred' ? e.starred : true
      LIMIT ${offset}, 10
      LET users = LENGTH(v) == 0 ? false :
        (FOR u IN 1 INBOUND v._id GRAPH 'pmsGraph' RETURN { id: u._id, avatar: u.avatar, name: u.displayName })
      LET conversation = { id: v._id, updatedAt: v.updatedAt, starred: e.starred, trashed: e.trashed,
        userIds: REMOVE_VALUE(users[*].id, ${userId})}
      RETURN { conversation, users })

    LET stat = (FOR s IN 1 INBOUND ${userId} GRAPH 'statsGraph' RETURN { id: s._id, inboxCount: s.inboxCount,
      trashedCount: s.trashedCount, starredCount: s.starredCount } )
    RETURN { conversations: c[*].conversation, stat, ids: c[*].conversation.id, users: UNIQUE(FLATTEN(c[*].users)) }
    `))
    .then(r => {
      if (r._result[0].conversations.length !== 0) {
        conversations = {
          conversations: toObject(r._result[0].conversations, 'id'),
          ids: r._result[0].ids,
          users: toObject(r._result[0].users, 'id')
        };
      }

      if (r._result[0].stat.length !== 0) {
        conversations.stats = toObject(r._result[0].stat, 'id');
        conversations.statId = r._result[0].stat[0].id;
        conversations.filter = filter;
      }

      res.status(200).json(conversations);
    }).catch(err => res.status(500).json(handleErrors('GET_CONVERSATIONS_ERROR: ', err)));
}

// POST ------------------------------------------------------------------------

export function filterConversation(req, res, t, value) {
  const userId = MAIN_USER;
  const id = convert(req.body.id, 'id');
  const type = t;
  const increment = value ? 1 : -1;
  const rating = { id, type: type + 'Count', value: increment };
  const errors = validate([id]);

  return (errors.length != 0 ? Promise.reject(errors) :
    db.query(aql`FOR v, e IN OUTBOUND SHORTEST_PATH ${userId} TO ${id} GRAPH 'pmsGraph' RETURN e._id`))
    .then(r => r._result.length == 0 ? Promise.reject(CONVERSATION_NOT_FOUND) :
      db.query(aql`LET c = DOCUMENT(${r._result[1]})
      LET rated = c[${type}] == ${value} ? true : false
      UPDATE c WITH { [${type}]: ${value} } IN inPM
      RETURN rated`))
    .then(r => r._result[0] ? Promise.reject(ALREADY_RATED) :
      updateStatCount(userId, type + 'Count', increment, userId, null))
    .then(() => type === 'trashed' ? updateStatCount(userId, 'inboxCount', -increment, userId, null) : '')
    .then(() => res.status(200).json(rating))
    .catch(err => res.status(500).json(handleErrors('FILTER_CONVERSATION_ERROR: ', err)));
}

// export function postConversation(req, res) {}

// export function addParticipants(req, res) {}

// export function updateLatestMessage(id, mId) {}

// REMOVE ----------------------------------------------------------------------

export function removeConversation(req, res) {
  const userId = MAIN_USER;
  const id = convert(req.body.id, 'id');
  let pm = '';
  let participants = 0;
  const errors = validate([id]);

  return (errors.length != 0 ? Promise.reject(errors) :
    db.query(aql`FOR v, e IN OUTBOUND SHORTEST_PATH ${userId} TO ${id} GRAPH 'pmsGraph' RETURN e._id`))
    .then(r => {
      if (r._result.length == 0) Promise.reject(CONVERSATION_NOT_FOUND)
      pm = r._result[1];
      return db.query(aql`
      LET c = DOCUMENT(${pm})
      LET starred = c.starred
      LET trashed = c.trashed
      FOR sT IN statTo
        FILTER sT._to == ${userId}
        FOR s IN statistics
        FILTER s._id == sT._from
        UPDATE s WITH { ['inboxCount']: s.inboxCount-1, ['starredCount']: starred ? s.starredCount-1 : s.starredCount,
          ['trashedCount']: trashed ? s.trashedCount-1 : s.trashedCount } 
        IN statistics RETURN true`)})
    .then(() => db.query(aql`FOR u, e IN 1 INBOUND ${id} GRAPH 'pmsGraph' RETURN { id: u._id, eId: e._id,
      deleted: e.deleted }`))
    .then(r => {
      participants = r._result.filter(p => !p.deleted);
      if (participants.length == 1) return db.query(aql`REMOVE DOCUMENT(${pm}) IN inPM RETURN true`);
      return db.query(aql`UPDATE DOCUMENT(${pm}) WITH { deleted: true } IN inPM RETURN 'false'`)} )
    .then(() => participants.length == 1 ? db.query(aql`FOR m, e IN INBOUND ${id} GRAPH 'messagesGraph' REMOVE m
      IN comments RETURN { id: m._id, eId: e._id }`) : 'skip')
    .then(r => r === 'skip' ? 'skip' : db.query(aql`FOR m IN ${r._result} REMOVE DOCUMENT(m.eId) IN messageOf RETURN m.id`))
    .then(r => r === 'skip' ? 'skip' : db.query(aql`FOR aO IN authorOf FILTER POSITION(${r._result}, aO._to, false)
      REMOVE DOCUMENT(aO._id) IN authorOf RETURN true`))
    .then(r => r === 'skip' ? 'skip' : db.graph('pmsGraph').vertexCollection('inPM').remove(id))
    .then(() => res.status(200).json({ id }))
    .catch(err => res.status(500).json(handleErrors('REMOVE_CONVERSATION_ERROR: ', err)));
}

export default {
  getConversation,
  getConversations,
  filterConversation,
  removeConversation,
}