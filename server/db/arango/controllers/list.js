import db from '../connect';
import { aql } from 'arangojs';
import {
  CANNOT_EDIT, DOCUMENT_NOT_FOUND, INVALID_ID, INVALID_LIST_ID, MAIN_USER, NO_LIST, NO_LISTS, NO_PARTICIPANTS,
  NO_PERMISSION, NOT_REGISTERED, PUBLIC_ID, USER_NOT_FOUND
} from './constants';
import { canEdit, hasPermission } from './user';
import { convert, handleErrors, getStats, toObject, updateStatCount, validate } from './misc';
import { getAllAuthors } from './fiction';


// GET -------------------------------------------------------------------------

export function getLists(req, res) {
  const userId = MAIN_USER;
  const id = req.params.id ? convert(req.params.id, 'userId') : userId;
  const offset = req.params.hasOwnProperty('offset') ? convert(req.params.offset, 'int') : 0;
  let lists = { userId: id };
  const errors = validate([id, offset]);

  return (errors.length != 0 ? Promise.reject(errors) : db.query(aql`
    LET user = DOCUMENT(${id})
    LET connected = ${userId} == ${PUBLIC_ID} || ${id} == ${userId} || LENGTH(user) == 0 ? false : (
      LET connection = (
        FOR v, e IN ANY SHORTEST_PATH ${id} TO ${userId} GRAPH 'connectionsGraph'
          FILTER e.type != "request"
          RETURN v._id
      )

      RETURN LENGTH(connection) == 0 ? false : true
    )

    LET level = ${id} == ${userId} ? 'own' : connected[0] ? 'friends' : ${userId} != ${PUBLIC_ID} ? 'registered'
      : 'public'

    LET hasAccess = LENGTH(user) == 0 ? false : POSITION(user.settings.privacy[level], 'lists', false)

    LET lists = !hasAccess ? 'NO_PERMISSION_LISTS' : (
      FOR l, e IN 1 OUTBOUND ${id} GRAPH 'listsGraph'
      FILTER e.type == 'list'
      SORT l.title ASC
      LIMIT ${offset}, 10
        RETURN { id: l._id, createdAt: l.createdAt, updatedAt: l.updatedAt, title: l.title }
    )
    LET listCount = !hasAccess ? 'NO_PERMISSION_LISTS' : (
      FOR v, e IN 1 INBOUND ${userId} GRAPH 'statsGraph'
      RETURN v.listCount
    )

    RETURN { lists: lists, ids: lists[*].id, user: { id: ${id}, name: user.displayName, listCount: listCount[0] } }`
  ))
  .then(r => {
    if (r._result[0].lists === NO_PERMISSION) return Promise.reject(NO_PERMISSION);
    if (!r._result[0].user.name) return Promise.reject(USER_NOT_FOUND);
    if (r._result[0].lists.length != 0) {
      lists.lists = toObject(r._result[0].lists, 'id');
      lists.ids = r._result[0].ids;
    } else {
      lists.lists = {};
      lists.ids = [];
    }

    lists.users = { [id]: r._result[0].user };
    res.status(200).json(lists)
  })
  .catch(err => res.status(500).json(handleErrors('GET_LISTS_ERROR: ', err)));
}

export function getList(req, res) {
  const userId = MAIN_USER;
  const id = convert(req.params.id, 'listId');
  let fiction = {
    children: {}, id: id, list: {}, ratings: {}, stats: {}, users: {}
  };
  const errors = validate([id]);

  return (errors.length != 0 ? Promise.reject(errors) : db.query(aql`
      LET l = DOCUMENT(${id})
      FOR lI IN listIn
        FILTER lI._to == l._id
        RETURN { id: l._id, createdAt: l.createdAt, title: l.title, authorIds: [lI._from] }`)
    )
    .then(r => {
      if(r._result.length == 0) return Promise.reject(DOCUMENT_NOT_FOUND);
      fiction.list = { [id]: r._result[0] };
      return db.query(aql`FOR f IN 1 OUTBOUND ${id} GRAPH 'listsGraph' RETURN f._id`);
    })
    .then(r => {
      if(r._result.length == 0) return 'skip';
      fiction.list[id] = { ...fiction.list[id], ['childrenIds']: r._result };
      return hasPermission(userId, r._result);
    })
    .then(r => {
      if (r === 'skip') return 'skip';

      let ids = [];
      fiction.list[id].childrenIds.forEach(c => {
        r.includes(c) ? ids.push(c) : '';
      });

      if (ids.length == 0) return 'skip';
      fiction.list[id].childrenIds = ids;
      
      return db.query(aql`FOR f IN ${ids}
        LET fiction = DOCUMENT(f)
        RETURN { id: fiction._id, categories: fiction.categories, summary: fiction.body, tags: fiction.tags,
          thumbnail: fiction.thumbnail, title: fiction.title, type: fiction.type }
      `)
    })
    .then(r => {
      if (r === 'skip') return 'skip';

      fiction.children = toObject(r._result, 'id');
      return getStats(fiction.list[id].childrenIds, 'fiction');
    })
    .then(r => {
      if (r === 'skip') return 'skip';
      fiction.stats = r.stats;
      r.ids.forEach((s, i) => fiction.children[r.to[i]].statId = s);
      return getAllAuthors(fiction.list[id].childrenIds);
    })
    .then(r => {
      if (r !== 'skip') {
        r.forEach(a => {
          fiction.children[a.authors[0].parentId] = {
            ...fiction.children[a.authors[0].parentId], ...{
              authorIds: a.ids,
              positions: a.positions
            }
          }
          fiction.users = { ...fiction.users, ...toObject(a.users, 'id') };
        });
      }
      
      return res.status(200).json(fiction);
    })
    .catch(err => res.status(500).json(handleErrors('GET_LIST_ERROR: ', err)));
}

export function getNotifications(req, res) {
  const userId = MAIN_USER;
  let notifications = { notifications: {}, ids: [] };
  const errors = validate([]);

  return (errors.length != 0 ? Promise.reject(errors) : db.query(aql`
      LET notifications = (FOR v, e IN INBOUND ${userId} GRAPH 'updatesGraph'
      SORT e.createdAt DESC
      LIMIT 0, 100
      LET author = (FOR u, e2 IN 1 INBOUND v._id GRAPH 'authorsGraph'
        FILTER e2.position == 'mainAuthor'
        RETURN { id: u._id, name: u.displayName }
      )
      RETURN { id: e._id, num: e.num, createdAt: e.createdAt, parentId: e.parentId, parentTitle: e.parentTitle,
        seen: e.seen, title: e.title, from: e._from, type: e.type, author: author[0] })

      RETURN { notifications, ids: notifications[*].id }
    `)
  ).then(r => { 
    if (r._result[0].ids.length != 0) {
      notifications.notifications = toObject(r._result[0].notifications, 'id');
      notifications.ids = r._result[0].ids;
      return db.query(aql`
        FOR v, e IN OUTBOUND ${userId} GRAPH 'updatesGraph'
        SORT e.createdAt DESC
        LIMIT 100, 500
        REMOVE e IN updateOf
        RETURN {}
      `);
    }

    return '';
  }).then(() => res.status(200).json(notifications))
  .catch(err => res.status(500).json(handleErrors('GET_NOTIFICATIONS_ERROR: ', err)));
}


// POST ------------------------------------------------------------------------

// export function postList(req, res) {}

// export function addToList(req, res) {}

// export function updateList(req, res) {}


// REMOVE ----------------------------------------------------------------------

export function removeList(req, res) {
  const userId = MAIN_USER;
  const id = convert(req.body.id, 'listId');
  const errors = validate([id]);

  return (errors.length != 0 ? Promise.reject(errors) : canEdit(userId, id, ''))
    .then(r => r ? db.graph('listsGraph').vertexCollection('lists').remove(id) : Promise.reject(CANNOT_EDIT))
    .then(() => updateStatCount(userId, 'listCount', -1, null, null))
    .then(() => res.status(200).json({ id: id }))
    .catch(err => res.status(500).json(handleErrors('REMOVE_LIST_ERROR: ', err)));
}

export function removeFromList(req, res) {
  const userId = MAIN_USER;
  const listId = convert(req.body.lId, 'listId');
  const id = req.body.id ? convert(req.body.id, `${req.body.id.includes('fictions/') ? 'fiction' : 'article'}Id` ) :
    { error: INVALID_ID };
  const errors = validate([listId, id]);

  return (errors.length != 0 ? Promise.reject(errors) : canEdit(userId, listId, ''))
    .then(r => r ? db.query(aql`FOR l IN listIn FILTER l._from == ${listId} && l._to == ${id}
      REMOVE l IN listIn`) : Promise.reject(NO_PERMISSION))
    .then(() => res.status(200).json({ deleted: id }))
    .catch(err => res.status(500).json(handleErrors('REMOVE_FROM_LIST_ERROR: ', err)));
}

export default {
  getList,
  getLists,
  getNotifications,
  removeFromList,
  removeList
};