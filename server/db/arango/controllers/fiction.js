import db from '../connect';
import { aql } from 'arangojs';
import { addView, convert, getRatings, getWordCount, handleErrors, getStats, postStat, toObject, updateRating,
  updateStatCount, validate } from './misc';
import { canEdit, markUpdates, hasPermission, postPermissions, postUpdates } from './user';
import { getComments, getReplies } from './comment';
import {
  ALREADY_POSTED_REVIEW,
  CANNOT_EDIT,
  DOCUMENT_NOT_FOUND,
  INVALID_ID,
  INVALID_PARENT,
  MAIN_USER,
  NO_PARENT_FOR_REVIEW,
  NO_PERMISSION,
  NOT_ENOUGH_WORD,
  NOT_REGISTERED,
  PUBLIC_ID, 
  NO_COMMENTS,
  NO_AUTHORS,
  NO_CHILDREN,
  NO_MORE_CHILDREN,
  NO_REVIEWS,
  FOLLOWER_ONLY
} from './constants';

// GET -------------------------------------------------------------------------

export function getFiction(fId, uId) {
  const id = fId;
  const userId = uId;
  
  return hasPermission(userId, [id])
  .then(p => {
    if (p.length == 0 || !p[0].includes('fictions')) return Promise.reject(p);

    return db.query(aql`
      LET parent = DOCUMENT(${id})
      
      LET parents = LENGTH(parent) == 0 ? null :  (
        FOR p IN 1..2 INBOUND parent._id GRAPH 'parentsGraph'
          RETURN { id: p._id, end: p.end, title: p.title, start: p.start, thumbnail: p.thumbnail }
      )

      LET series = LENGTH(parents) == 0 ? null : (
        FOR p, e IN 0..15 OUTBOUND parents[0].start GRAPH 'nextToGraph'
          RETURN { id: p._id, title: p.title, type: e.type, createdAt: p.createdAt }
      )

      RETURN LENGTH(parent) == 0 ? ${DOCUMENT_NOT_FOUND} : {
        id: parent._id,
        type: parent.type,
        title: parent.title,
        createdAt: parent.createdAt,
        updatedAt: parent.updatedAt,
        authorNote: parent.authorNote,
        body: parent.body,
        thumbnail: parent.thumbnail,
        categories: parent.categories,
        tags: parent.tags,
        start: parent.start,
        end: parent.end,
        parent: parents,
        series: series,
        status: parent.status,
        schedule: parent.schedule,
        scheduleType: parent.scheduleType,
        frequency: parent.frequency,
        followerChapters: parent.followerChapters
      }
    `);
    }).catch(err => handleErrors('GET_FICTION_ERROR: ',  err));
}

export function getParent(cId, uId) {
  const id = cId;
  const userId = uId;
  let parent;

  return db.query(aql`FOR parent IN 1 INBOUND ${id} GRAPH 'parentsGraph'
      RETURN {
        id: parent._id,
        type: parent.type,
        title: parent.title,
        createdAt: parent.createdAt,
        updatedAt: parent.updatedAt,
        authorNote: parent.authorNote,
        body: parent.body,
        thumbnail: parent.thumbnail,
        categories: parent.categories,
        tags: parent.tags,
        start: parent.start,
        end: parent.end,
        status: parent.status,
        schedule: parent.schedule,
        scheduleType: parent.scheduleType,
        frequency: parent.frequency,
        followerChapters: parent.followerChapters
      }`)
    .then(r => {
      parent = r._result[0];
      return r._result.length == 0 ? DOCUMENT_NOT_FOUND : hasPermission(userId, parent.id);
    })
    .then(r => r === DOCUMENT_NOT_FOUND ? r : !r[0].includes('fictions') ? NO_PERMISSION : parent)
    .catch(err => handleErrors('GET_PARENT_ERROR: ', err))
}

export function getBook(req, res) {
  const userId = MAIN_USER;
  const ip = '188.882.5.78.3';
  const vId = req.user ? userId : ip;
  const vType = req.user ? "user" : "ip";
  const id = convert(req.params.id, 'fictionId');
  const errors = validate([id]);
  let parent = {};

  return (errors.length != 0 ? Promise.reject(errors) : getFiction(id, userId))
    .then(r => { // does it exists? -> get authors
      if (r._result[0] === DOCUMENT_NOT_FOUND) return Promise.reject(DOCUMENT_NOT_FOUND);

      parent = {
        fiction: { [id]: r._result[0] },
        id,
        type: 'comments',
        ratings: {[id]: { down: 'none', favorite: 'none', follow: 'none', ratings: Array(5).fill(0), subscribtion: 0,
          up: 'none'} } 
      };
      return getRatings(id, userId);
    })
    .then(r => {

      if(r._result.length !== 0) { 
        r._result.forEach(d => {
          parent.ratings[id][d.type] = d.id;
        });
      }
      return hasReview(userId, id);
    })
    .then(r => { // get authors
      if (r) {
        const type = ['overall', 'style', 'grammar', 'story', 'characters'];
        parent.ratings[id].ratings = type.map(t => r.score[t] ? r.score[t] : 0);
        parent.ownReview = { id: r._id, score: r.score };
      } else parent.ownReview = {};
      
      return getAuthors(id);
    })
    .then(r => { // get children (volumes)
      parent.users = r.authors;
      parent.fiction[id].authorIds = r.ids;
      parent.fiction[id].positions = r.positions.map(p => p.join(', '));
      return parent.fiction[id].start ? getChildren(null, null, userId, parent.fiction[id]) : false;
    })
    .then(r => { // get articles
      if (!r || r === NO_CHILDREN) {
        parent.children = {};
        parent.fiction[id].childrenIds = [];
        parent.fiction[id].selectedChild = '';
        return false;
      } 

      parent.children = r.children;
      parent.fiction[id].childrenIds = r.ids;
      parent.fiction[id].selectedChild = r.ids[0];

      return r.ids.length != 0 && r.children[r.ids[0]].start ? getChildren(null, null, userId, r.children[r.ids[0]]) :
        '';
    })
    .then(r => { // get stats
      if (!r || r === NO_CHILDREN) {
        parent.chapters = {};
      } else {
        parent.chapters = r.children;
        parent.children[parent.fiction[id].childrenIds[0]].chapterIds = r.ids;
      }
      
      return getStats([id], parent.fiction[id].type, true);
    })
    .then(r => { // update view count
      parent.stats = r.stats;
      const sId = r.ids[0];
      parent.fiction[id].statId = sId;
      parent.statId = sId;
      return addView(id, sId, r.stats[sId], vId, vType);
    })
    .then(() => markUpdates(id, userId))
    .then(() => { // get comments
      parent.stats[parent.fiction[id].statId].views = parent.stats[parent.fiction[id].statId].views.complete.complete;
      return getComments(null, null, id, 0, 'book');
    })
    .then(r => { // get replies
      if (r.ids.length !== 0) {
        parent.comments = r.comments;
        parent.fiction[id].commentIds = r.ids;
        parent.fiction[id].replyIds = r.replyIds;
        parent.replies = r.replies;
        parent.ratings = { ...parent.ratings, ...r.ratings };
        parent.users = { ...parent.authors, ...r.authors };
      }else{
        parent.fiction.commentIds = [];
        parent.comments = {};
        parent.fiction[id].commentIds = [];
      }

      return res.status(200).json(parent);
    })
    .catch(err => res.status(500).json(handleErrors('GET_BOOK_ERROR: ' , err)));
}

export function getHome(req, res) {
  const userId = MAIN_USER;
  let data = {};

  return db.query(aql`
    LET chapters = (
      FOR c IN articles
      SORT c.createdAt DESC
      FILTER !c.draft
      LET isRestricted = (
        LET t = (
          FOR a, e IN INBOUND SHORTEST_PATH c._id TO ${userId} GRAPH 'permissionsGraph' RETURN e
        )
        RETURN t[1].type ? false : t[1].type
      )
      FILTER isRestricted[0] == 'exclude' ? false : true
      LET parents = (FOR p IN 1..2 INBOUND c._id GRAPH 'parentsGraph'
        RETURN { id: p._id, cover: p.cover, end: p.end, featured: p.featured, num: p.num, summary: p.body,
           title: p.title })
      FILTER parents[1].featured
      LIMIT 3
      LET end = DOCUMENT(parents[1].end).end
      LET num = c.num ? '' : (
        FOR a IN ANY SHORTEST_PATH c._id TO end GRAPH 'nextToGraph' RETURN a._key
      )
      LET parentStat = c.num ? 0 : (FOR s IN INBOUND parents[1].id GRAPH 'statsGraph'
        RETURN { chapters: s.chapterCount }
      )
      LET stat = (FOR s IN INBOUND c._id GRAPH 'statsGraph'
        RETURN { comments: s.commentCount })
      RETURN { id: c._id, createdAt: c.createdAt, featured: true, title: c.title, num: c.num ? c.num :
        parentStat[0].chapters - LENGTH(num)+1, parents }
    )
    RETURN { chapters, ids: chapters[*].id }`)
  .then(r => {
    r._result[0].chapters.map((c, i) => delete r._result[0].chapters[i]['positions']);
    data = {
      chapters: toObject(r._result[0].chapters, 'id'),
      featuredIds: r._result[0].ids
    };

    return db.query(aql`
      LET fictions = (
        FOR f IN fictions
        SORT RAND()
        FILTER f.featured
        LET isRestricted = (
          LET t = (
            FOR a, e IN INBOUND SHORTEST_PATH f._id TO ${userId} GRAPH 'permissionsGraph' RETURN e
          )
          RETURN t[1].type ? false : t[1].type
        )
        FILTER isRestricted[0] == 'exclude' ? false : true
        LIMIT 5
        RETURN { id: f._id, categories: f.categories, cover: f.cover, summary: f.body, tags: f.tags, title: f.title }
      )
      RETURN { fictions, ids: fictions[*].id }`);
    })
  .then(r => {
    data.fictions = toObject(r._result[0].fictions, 'id');
    data.fictionIds = r._result[0].ids;
    return db.query(aql`
      LET chapters = (
        FOR c IN articles
        SORT c.createdAt DESC
        FILTER !c.draft
        LET isRestricted = (
          LET t = (
            FOR a, e IN INBOUND SHORTEST_PATH c._id TO ${userId} GRAPH 'permissionsGraph' RETURN e
          )
          RETURN t[1].type ? false : t[1].type
        )
        FILTER isRestricted[0] == 'exclude' ? false : true
        LET parents = (FOR p IN 1..2 INBOUND c._id GRAPH 'parentsGraph'
          RETURN { id: p._id, cover: p.cover, end: p.end, featured: p.featured, num: p.num, summary: p.body,
            title: p.title }
        )
        LET end = DOCUMENT(parents[1].end).end
        LET num = c.num ? '' : (
          FOR a IN ANY SHORTEST_PATH c._id TO end GRAPH 'nextToGraph' RETURN a._key
        )
        LET parentStat = c.num ? 0 : (FOR s IN INBOUND parents[1].id GRAPH 'statsGraph'
          RETURN { chapters: s.chapterCount }
        )
        LET rating = ${userId} == ${PUBLIC_ID} ? null : (
          FOR r, e IN INBOUND c._id GRAPH 'ratingsGraph'
          FILTER e._from == ${userId}
          RETURN { key: e._key, type: e.type }
        )
        LET stat = (FOR s IN INBOUND c._id GRAPH 'statsGraph'
          RETURN { id: s._id, commentCount: s.commentCount, down: s.down, ratio: s.ratio, up: s.up }
        )
        RETURN { id: c._id, createdAt: c.createdAt, featured: parents[1].featured, title: c.title, num: c.num ? c.num : 
          parentStat[0].chapters - LENGTH(num)+1, parents, rating, stat: stat[0], statId: stat[0].id }
      )
      RETURN { chapters, ids: chapters[*].id, ratings: chapters[*].rating, stats: chapters[*].stat }
    `)
  })
  .then(r => {
    r._result[0].chapters.map((c, i) => delete r._result[0].chapters[i]['stat']);
    r._result[0].chapters.map((c, i) => delete r._result[0].chapters[i]['rating']);
    r._result[0].chapters.map((c, i) => delete r._result[0].chapters[i]['positions']);
    r._result[0].ratings = r._result[0].ratings.filter(r => r !== null);
    data.chapters = { ...data.chapters, ...toObject(r._result[0].chapters, 'id') };
    data.chapterIds = r._result[0].ids;
    data.ratings = {};
    data.stats = toObject(r._result[0].stats, 'id');
    r._result[0].ratings.forEach((f, i) => {
      f.forEach((ratings, j) => {
        ratings ? data.ratings[r._result[0].chapters[i].id] = { ...data.ratings[r._result[0].chapters[i].id],
          [ratings.type]: ratings.key } : '';
      });
    });
    return getAllAuthors([...data.chapterIds, ...data.fictionIds]);
  })
  .then(r => {
    r.forEach(a => {
      data.chapters.hasOwnProperty(a.authors[0].parentId) ? data.chapters[a.authors[0].parentId] = {
        ...data.chapters[a.authors[0].parentId], ...{
          authorIds: a.ids,
          positions: a.positions
        }
      } :
      data.fictions[a.authors[0].parentId] = {
        ...data.fictions[a.authors[0].parentId], ...{
          authorIds: a.ids,
          positions: a.positions
        }
      };
      data.users = { ...data.users, ...toObject(a.users, 'id') };
    });
    return res.status(200).json(data);
  })
  .catch(err => res.status(500).json(handleErrors('GET_HOME_ERROR: ', err)));
}

export function getAuthors(cId){
  const id = cId;

  return db.query(aql`
    LET authors = (FOR u, e IN 1 INBOUND ${id} GRAPH 'authorsGraph'
      RETURN { id: u._id, link: u.link, avatar: u.avatar, name: u.displayName, positions: e.positions }
    )
    RETURN { authors, ids: authors[*].id, positions: authors[*].positions }
    `)
    .then(r => r._result[0].ids.length === 0 ? Promise.reject(NO_AUTHORS) : 
      { authors: toObject(r._result[0].authors, 'id'), ids: r._result[0].ids, positions:
      r._result[0].positions })
    .catch(err => handleErrors('GET_AUTHORS_ERROR: ', err));
}

export function getAllAuthors(ids){
  return db.query(aql`
    FOR p IN ${ids}
      LET authors = (FOR u, e IN 1 INBOUND p GRAPH 'authorsGraph'
        FILTER e.status != 'request'
        RETURN { parentId: p, profile: {id: u._id, link: u.link, avatar: u.avatar, name: u.displayName},
          position: e.position })
      RETURN { authors: authors, ids: authors[*].profile.id, positions: authors[*].position, users: authors[*].profile }
    `)
    .then(r => r._result.length === 0 ? Promise.reject(NO_AUTHORS) : r._result)
    .catch(err => handleErrors('GET_ALL_AUTHORS_ERROR: ', err));
}

export function getUniverse(req, res) {
  const userId = MAIN_USER;
  const id = convert(req.params.id, 'fiction');
  const errors = validate([id]);
  let universe = { id };
  let children;
  
  return (errors.length != 0 ? Promise.reject(errors) : hasPermission(userId, id))
    .then(r => r[0] !== id ? Promise.reject(NO_PERMISSION) : db.query(aql`LET u = DOCUMENT(${id})
      RETURN { id: u._id, start: u.start, thumbnail: u.thumbnail, title: u.title }`))
    .then(r => {
      universe.fiction = toObject(r._result, 'id');
      return getStats(id, 'universe', false);
    })
    .then(r => {
      universe.stat = r.stats;
      universe.fiction[id].statId = r.ids[0];
      return getChildren(null, null, userId, universe.fiction[id])
    })
    .then(r => {
      if (!r || r === NO_CHILDREN) return Promise.reject(r);
      universe.children = r;
      universe.childrenIds = r.ids;

      return getAllAuthors(universe.childrenIds.concat(id));
    })
    .then(r => {
      r.forEach(a => {
        universe.children.hasOwnProperty(a.authors[0].parentId) ? universe.children[a.authors[0].parentId] = {
          ...children.children[a.authors[0].parentId], ...{ authorIds: a.ids, positions: a.positions }
        } : 
        universe.fiction[a.authors[0].parentId] = {
          ...universe.fiction[a.authors[0].parentId], ...{ authorIds: a.ids, positions: a.positions }
        };
        universe.users = { ...universe.users, ...toObject(a.users, 'id') };
      });

      universe.ratings = {
        [id]: { down: 'none', favorite: 'none', follow: 'none', rating: 0, subscribtion: 0, up: 'none' }
      };

      return getRatings(id, userId);
    })
    .then(r => {
      if (r._result.length !== 0) {
        r._result.forEach(d => {
          universe.ratings[universe.id][d.type] = d.id;
        });
      }
      return res.status(200).json(universe);
    })
    .catch(err => res.status(500).json(handleErrors('GET_UNIVERSE_ERROR: ', err)))
}

export function getChildren(req, res, uId, p){
  const userId = MAIN_USER;
  const type = req ? convert(req.params.type, 'parentType') : 'fictions';
  const startId = req ? typeof type === 'string' ? convert(req.params.id, type.slice(0, -1) + 'Id') :
    { error: 'Type is invalid!' } : p.start;
  const to = req || !p || (p && p.type === 'volume') ? 500 : 0;
  const errors = validate([startId, type]);
  const from = (req && typeof req.url === 'string' && req.url.split('/')[3] === 'volume') || !req ? 0 : 1;
  let children = {};
  let parent;
  
  return (errors.length != 0 ? Promise.reject(errors) : p ? Promise.resolve(p) : getParent(startId, userId))
    .then(r => {
      if (r === DOCUMENT_NOT_FOUND) return Promise.reject(DOCUMENT_NOT_FOUND);
      if (r === NO_PERMISSION) return Promise.reject(NO_PERMISSION);
      if (r.start === null) return Promise.reject(NO_CHILDREN);
      parent = r;

      return db.query(aql`
        LET children = (FOR v IN ${from}..${to} OUTBOUND ${startId} GRAPH 'nextToGraph'
          LET volume = v.type != 'chapter' ? null : (FOR p IN 1 INBOUND v._id GRAPH 'parentsGraph' RETURN p._id)
          FILTER ${parent.type} == 'volume' ? volume[0] == ${parent.id} : true
          RETURN { id: v._id, categories: v.categories, createdAt: v.createdAt, summary: v.type != 'chapter' ? v.body
            : '', start: v. start, status: v.status, tags: v.tags, thumbnail: v.thumbnail, title: v.title, type: v.type }
        )
        RETURN { children, ids: children[*].id }
      `);
    }).then(r => {
      if (r._result[0].children.length === 0) return NO_MORE_CHILDREN;

      children.ids = r._result[0].ids;
      children.children = toObject(r._result[0].children, 'id');
      children.id = startId;
      children.parentId = parent.id;
      return hasPermission(userId, children.ids);
    }).then(r => { // get stats for children
      if (r === NO_MORE_CHILDREN) return NO_MORE_CHILDREN;

      r.forEach((p, i) => {
        if (p.includes('fictions/') || p.includes('articles/')) return;
        if (p === FOLLOWER_ONLY) {
          children.children[children.ids[i]] = { id: children.ids[i], title: children.children[children.ids[i]].title,
            followerOnly: true };
          return;
        }
        children.ids = children.ids.filter(id => id !== children.ids[i])
        delete children.children[children.ids[i]];
      });

      if (children.ids.length == 0) Promise.reject(NO_CHILDREN);
      return children.children[children.ids[0]].type === 'volume' ||
        children.children[children.ids[0]].type === 'chapter' ? 'skip' : getStats(children.ids, '', false);
    }).then(r => { // 
      if (r === NO_MORE_CHILDREN) children = { children: {}, ids: [], stats: {}, statsIds: [] }
      else if (r !== 'skip') {
        children.stats = r.stats;
        children.statsIds = r.ids;
        r.ids.forEach((s, i) => children.children[r.to[i]].statId = s);
      }
      return res !== null ? res.status(200).json(children) : children;
    }).catch(err => res !== null ? res.status(500).json(handleErrors('GET_CHILDREN_ERROR: ', err)) :
      handleErrors('GET_CHILDREN_ERROR: ', err));
}

export function getReviews(req, res) {
  const userId = MAIN_USER;
  const id = convert(req.params.id, 'fictionId')
  const offset = convert(req.params.offset, 'int');
  const sortBy = convert('createdAt', 'sortBy');
  const sortOrder = convert('ASC', 'sortOrder');
  const type = 'review';
  const errors = validate([id, offset]);
  let reviews = {};

  return (errors.length != 0 ? Promise.reject(errors) : db.query(aql`
    LET r = (
      FOR v IN 1 INBOUND ${id} GRAPH 'reviewsGraph'
        LET author = (FOR u, e IN 1 INBOUND ${id} GRAPH 'authorsGraph'
          RETURN { id: u._id, link: u.link, avatar: u.avatar, name: u.displayName }
        )
        FILTER !v.rating || author[0].id == ${userId}
        LET stat = (FOR s, e IN 1 INBOUND v._id GRAPH 'statsGraph'
            RETURN { id: e._from, up: s.up, down: s.down, replyCount: s.replyCount }
        )
        SORT ${type} == 'stat' ? stat[0][${sortBy}] : v[${sortBy}] ${sortOrder}
        LIMIT ${offset}, 1
        LET rating = (
          FOR r, e IN 1 OUTBOUND ${userId} GRAPH 'ratingsGraph'
          FILTER e._to == v._id
          RETURN { id: r._id, rId: e._key, type: e.type }
        )
      RETURN { author: author[0], authorId: author[0].id, id: v._id, date: v.createdAt, down: stat[0].down, 
        edited: v.updatedAt, rating: rating[0], replyCount: stat[0].replyCount, statId: stat[0].id, score: v.score,
        text: v.text, title: v.title, type: v.type, up: stat[0].up
      }
    )
    RETURN LENGTH(r) == 0 ? ${NO_REVIEWS} : { reviews: r, ids: r[*].id, authors: r[*].author, ratings: r[*].rating }`))
  .then(r => {
    if (r._result[0] !== NO_REVIEWS) {
      r._result[0].reviews.map((c, i) => delete r._result[0].reviews[i]['author']);
      r._result[0].ratings = r._result[0].ratings.filter(r => r !== null);

      reviews = {
        comments: toObject(r._result[0].reviews, 'id'),
        fiction: id,
        ids: r._result[0].ids,
        users: toObject(r._result[0].authors, 'id'),
        ratings: {}
      };

      r._result[0].ratings.forEach(r => reviews.ratings[r.id] = { [r.type]: r.rId });
    } else {
      reviews = {
        comments: {},
        fiction: id,
        ids: [],
        users: {},
        ratings: {}
      };
    }

    return reviews.ids.length != 0 ? getReplies(null, null, reviews.ids, 0, userId) : NO_COMMENTS;
  })
  .then(r => {
    if (r !== NO_COMMENTS) {
      reviews.comments = { ...reviews.comments, ...r.comments };
      reviews.replyIds = r.ids;
      reviews.replies = r.replies;
      reviews.users = { ...reviews.users, ...r.users };
      reviews.ratings = { ...reviews.ratings, ...r.ratings };
    } else {
      reviews.replies = {};
    }
    res.status(200).json({ ...reviews, type: 'reviews' });
  })
  .catch(err => res.status(500).json(handleErrors('GET_REVIEWS_ERROR: ', err)));
}

export function getDashboard(req, res) {
  const userId = MAIN_USER;
  const id = convert(req.params.id, 'fictionId');
  let ids = [];
  let data;
  let type;
  const extend = req.params.chaptersFrom ? 'chapters' : req.params.childrenFrom ? 'volumes' : '';
  const childrenFrom = convert(req.params.hasOwnProperty('chaptersFrom') ? 0 : req.params.hasOwnProperty('childrenFrom')
    ? 1 : 0, 'int');
  const chaptersFrom = convert(req.params.hasOwnProperty('chaptersFrom') ? req.params.chaptersFrom : 0, 'int');
  const errors = validate([id, chaptersFrom, childrenFrom]);

  return (errors.length != 0 ? Promise.reject(errors) : canEdit(userId, id, ''))
  .then(r => !r ? Promise.reject(NO_PERMISSION) : getFiction(id, userId))
  .then(r => { // get articles if parent is book
    data = { fiction: { [id]: r._result[0] }, id };
    type = data.fiction[id].type;
    const start = req.params.chaptersFrom || req.params.childrenFrom ? req.params.childrenFrom :
    data.fiction[id].end;
    return start ? getDashboardChildren(start, type, childrenFrom, chaptersFrom) : false;
  })
  .then(r => {
    if (extend === 'chapters' && r._result[0].chapterIds.length == 0) return Promise.reject(NO_MORE_CHILDREN);
    if (extend === 'volumes' && r._result[0].childrenIds.length == 0) return Promise.reject(NO_MORE_CHILDREN);
    if (r) {
      r._result[0].children.map((c, i) => delete r._result[0].children[i]['chapters']);
      data.chapters = toObject(r._result[0].chapters, 'id');
      data.children = toObject(r._result[0].children, 'id');
      data.fiction[id].childrenIds = r._result[0].childrenIds;
      ids = [...r._result[0].chapterIds, ...r._result[0].childrenIds];
    } else {
      data.chapters = {};
      data.children = {};
      data.fiction[id].childrenIds = [];
      ids= [];
    }

    return getStats(extend !== '' ? ids : [...ids, id], 'book', true);
  })
  .then(r => {
    r.to.forEach((s, i) => {
      const type = data.fiction.hasOwnProperty(s) ? 'fiction' : data.children.hasOwnProperty(s) ? 'children' :
        'chapters';
      data[type][s] = { ...data[type][s], ...{ statId: r.ids[i] } };
    });
    data.stats = r.stats;

    return db.query(aql`
      FOR v IN 1 INBOUND ${id} GRAPH 'viewsGraph'
      SORT v.year DESC
      RETURN MERGE({ id: v._id }, UNSET(v, '_id', '_key', '_rev'))
    `);
  })
  .then(r => {
    data.stats[data.fiction[id].statId].views = { ...data.stats[data.fiction[id].statId].views,
      ...toObject(r._result, 'year')};

    if (ids.length == 0) return false;
    if (type === 'book') ids = extend !== '' ? ids.filter(i => !i.includes('fictions')) :
      ids.filter(i => !i.includes('fictions')).concat(id);

    return db.query(aql`
      FOR id IN ${ids}
        LET comments = (
          FOR c, e IN 1 ANY id GRAPH 'commentsGraph'
          FILTER c.type == 'comment'
          SORT c.createdAt DESC
          LIMIT 1
          LET author = (FOR u IN 1 INBOUND c._id GRAPH 'authorsGraph' RETURN u.displayName)
            
          RETURN { createdAt: c.createdAt, by: author[0], to: id }
        )
        RETURN comments[0]
    `);
  })
  .then(r => {
    if (!r) return 'skip';
    ids.forEach((d, i) => {
      const t = data.fiction.hasOwnProperty(d) ? 'fiction' : data.children.hasOwnProperty(d) ? 'children' :
      'chapters';
      data[t][d] = { ...data[t][d], ...{ comment: r._result[i] } };
    });

    return type === 'book' && extend === '' ? 
      getComments({ params: { ['pType']: 'chapter', id, offset: 0, } }, null, null, null, 0)
      : 'skip';
  })
  .then(r => {
    if (r === 'skip' || r.ids.length == 0) {
      data.comments = {};
      data.fiction[id].commentIds = [];
      data.ratings = {};
      data.users = {};
    } else {
      data.comments = r.comments;
      data.fiction[id].commentIds = r.ids;
      data.users = { ...data.users, ...r.authors };
      data.ratings = r.ratings;
    }
    
    return res.status(200).json(data);
  })
  .catch(err => res.status(500).json(handleErrors('GET_DASHBOARD_ERROR: ', err)));
}

export function getDashboardChildren(s, t, cF, chaF) {
  const start = s.includes('fictions/') ? s : 'fictions/' + s;
  let type = t;
  const chaptersFrom = chaF;
  const chaptersTo = chaptersFrom === 0 ? 4 : chaptersFrom + 10;
  const childrenFrom = cF;
  const childrenTo = chaptersFrom === 0 ? childrenFrom + 10 : 0;
  
  return db.query(aql`
    LET children = (FOR c IN ${childrenFrom}..${childrenTo} INBOUND ${start} GRAPH 'nextToGraph'
      LET chapters = ${type} != 'book' ? '' : (
        FOR v IN ${chaptersFrom}..${chaptersTo} INBOUND c.end GRAPH 'nextToGraph'
        LET isChild = (FOR p IN INBOUND SHORTEST_PATH v._id TO c._id GRAPH 'parentsGraph' RETURN p._id)
        FILTER LENGTH(isChild) != 0
        RETURN { id: v._id, cover: v.cover, title: v.title, updatedAt: v.updatedAt })
      RETURN { id: c._id, chapterCount: c.chapterCount, cover: c.cover, num: c.num, title: c.title, type: c.type,
        updatedAt: c.updatedAt, chapterIds: FLATTEN(chapters[*].id), chapters })
    LET childrenIds = children[*].id
    LET chapterIds = FLATTEN(children[*].chapterIds)
    RETURN { chapters: FLATTEN(children[*].chapters), chapterIds, children, childrenIds }
  `)
  .then(r => r)
  .catch(err => handleErrors('GET_DASHBOARD_CHILDREN_ERROR: ', err));
}

export function getSubmit(req, res) {
  const userId = MAIN_USER;
  const type = req.params.type;
  const parentType = type === 'chapter' || type === 'volume' ? 'book' : type === 'book' ? 'series' : 'universe';

  return db.query(aql`
      FOR v, e IN 1 OUTBOUND ${userId} GRAPH 'authorsGraph' FILTER v.type == ${parentType} SORT v.updatedAt
      RETURN { id: v._id, title: v.title }`)
    .then(r => res.status(200).json({ type: req.params.type, parents: r._result }))
    .catch(err => res.status(500).json(handleErrors('GET_SUBMIT_ERROR: ' + err)));
}

export function getChooseParent(req, res) {
  const id = convert(req.params.id, 'fictionId');
  const index = convert(req.params.index, 'int');
  const errors = validate([id, index]);
  
  return (errors.length != 0 ? Promise.reject(errors) : db.query(aql`
    LET authors = (FOR v, e IN 1 INBOUND ${id} GRAPH 'authorsGraph'
      FILTER e.status != 'request'
      RETURN { id: v._id, name: v.displayName, positions: e.positions })
    LET chapterCount = (FOR s IN 1 INBOUND ${id} GRAPH 'statsGraph' RETURN s.chapterCount)
    LET fiction = DOCUMENT(${id})
    LET volumes = fiction.type != 'book' ? '' : (
      FOR v IN 0..150 OUTBOUND fiction.start GRAPH 'nextToGraph' RETURN { id: v._id, num: v.num, title: v.title })
    RETURN { authors, chapterCount: chapterCount[0]+1, volumeCount: LENGTH(volumes) == 0 ? 1 : volumes[LENGTH(volumes)-1].num+1, volumes }
    `))
    .then(r => res.status(200).json({ authors: r._result[0].authors, chapterCount: r._result[0].chapterCount, volumeCount: r._result[0].volumeCount, id, index,
      volumes: r._result[0].volumes }))
    .catch(err => res.status(500).json(handleErrors('GET_CHOOSE_PARENT_ERROR: ' + err)));
}


// POST ------------------------------------------------------------------------

export function postBook(req, res) {
  const userId = MAIN_USER;
  const title = convert(req.body.title, 'title');
  const parentId = req.body.parentId ? convert(req.body.parentId, 'fictionId') : null;
  const categories = convert(req.body.categories, 'categories');
  const tags = convert(req.body.tags, 'tags');
  const schedule = convert(req.body.schedule, 'schedule');
  const scheduleType = convert(req.body.scheduleType, 'scheduleType');
  const followerChapters = convert(req.body.followerChapters, 'followerChapters');
  const draft = convert(req.body.draft, 'bool');
  const autoIndex = convert(req.body.autoIndex, 'bool');
  let authors = convert(req.body.authors, 'authors');
  const authorNote = req.body.authorNote ? convert(req.body.authorNote, 'richText') : null;
  const body = convert(req.body.body, 'richText');
  const thumbnail = convert(req.body.thumbnail, 'thumbnail');
  const errors = validate([title, parentId, categories, tags, schedule, scheduleType, followerChapters, draft, autoIndex,
    authors, authorNote, body, thumbnail]);
  const wordCount = getWordCount(body);
  const type = 'book';
  let newId;

  return (wordCount < 15 ? Promise.reject(NOT_ENOUGH_WORD + '15)') : errors.length != 0 ?
    Promise.reject(errors.join('\n')) : parentId ? canEdit(userId, parentId, '') : Promise.resolve(true))
    .then(r => {
      if (!r) return Promise.reject(CANNOT_EDIT);

      let frequency = 0;
      schedule.forEach(s => frequency += s[0] + s[1]);
      const fiction = {
        createdAt: convert(null, 'dateNow'),
        updatedAt: convert(null, 'dateNow'),
        title,
        categories,
        tags,
        schedule,
        scheduleType,
        followerChapters,
        draft,
        autoIndex,
        authorNote,
        body,
        frequency,
        statType: `${type}Count`,
        status: 'active',
        thumbnail,
        type: 'book'
      };

      return db.query(aql`INSERT ${fiction} IN fictions LET new = NEW RETURN new`);
    }).then(fiction => {
      newId = fiction._result[0]._id;
      let index = -1;
      authors.forEach((a, i) => a.id === userId ? index = i : '');
      index < 0 ? authors.push({ id: userId, positions: ['poster'] }) :
        authors[index].positions = [...authors[index].positions, 'poster'];

      return postAuthors(authors, newId, userId);
    })
    .then(() => parentId && postParentTo(newId, parentId))
    .then(() => parentId && postNextTo(newId, parentId))
    .then(() => parentId && updateFirstAndLast(newId, parentId, 'end'))
    .then(() => postStat(newId, 'fiction', { volumeCount: 0 }))
    .then(() => parentId && updateStatCount(parentId, autoIndex ? 'childrenCount' : 'bookCount', 1, userId, null))
    .then(() => updateStatCount(authors.map(a => a.id), 'bookCount', 1, userId, null))
    .then(() => postUpdates(authors.map(a => a.id), newId, userId))
    .then(() => parentId && postUpdates([parentId], newId, userId))
    .then(() => res.status(200).json({ id: newId, title, type, updated: false }))
    .catch(err => res.status(500).json(handleErrors('POST_BOOK_ERROR: ', err)));
}

export function postParent(req, res) {
  const userId = MAIN_USER;
  const title = convert(req.body.title, 'title');
  const type = convert(req.body.type, 'parentType');
  const parentId = req.body.parentId ? convert(req.body.parentId, 'fictionId') : null;
  const draft = convert(req.body.draft, 'bool');
  const autoIndex = convert(req.body.autoIndex, 'bool');
  let authors = convert(req.body.authors, 'authors');
  const thumbnail = convert(req.body.authors, 'thumbnail');
  const errors = validate([title, type, parentId, draft, autoIndex, authors, thumbnail]);
  let newId;

  return (errors.length != 0 ? Promise.reject(errors.join('\n')) : parentId ? canEdit(userId, parentId, '') :
    Promise.resolve(true))
    .then(r => {
      if (!r) return Promise.reject(CANNOT_EDIT);

      const fiction = {
        createdAt: convert(null, 'dateNow'),
        updatedAt: convert(null, 'dateNow'),
        title,
        draft,
        autoIndex,
        statType: `${type}Count`,
        thumbnail,
        type
      };

      return db.query(aql`INSERT ${fiction} IN fictions LET new = NEW RETURN new`);
    }).then(fiction => {
      newId = fiction._result[0]._id;
      let index = -1;
      authors.forEach((a, i) => a.id === userId ? index = i : '');
      index < 0 ? authors.push({ id: userId, positions: ['poster'] }) :
        authors[index].positions = [...authors[index].positions, 'poster'];

      return postAuthors(authors, newId, userId);
    })
    .then(() => parentId && postParentTo(newId, parentId))
    .then(() => parentId && postNextTo(newId, parentId))
    .then(() => parentId && updateFirstAndLast(newId, parentId, 'end'))
    .then(() => postStat(newId, 'parent', { }))
    .then(() => parentId && updateStatCount(parentId, autoIndex ? 'childrenCount' : `${type}Count`, 1, userId, null))
    .then(() => updateStatCount(authors.filter(a => a.id === userId), `${type}Count`, 1, userId, null))
    .then(() => postUpdates(authors.map(a => a.id), newId, userId))
    .then(() => parentId && postUpdates([parentId], newId, userId))
    .then(() => res.status(200).json({ newId, title, type, updated: false }))
    .catch(err => res.status(500).json(handleErrors('POST_PARENT_ERROR: ', err)));
}

export function postVolume(req, res) {
  const userId = MAIN_USER;
  const title = convert(req.body.title, 'text');
  const type = 'volume';
  const parentId = convert(req.body.parentId, 'fictionId');
  let authors = convert(req.body.authors, 'authors');
  const thumbnail = '';
  const errors = validate([title, parentId, authors, thumbnail]);
  let newId;

  return (errors.length != 0 ? Promise.reject(errors.join('\n')) : canEdit(userId, parentId, ''))
    .then(r => !r ? Promise.reject(CANNOT_EDIT) : db.query(aql`
      LET parent = DOCUMENT(${parentId})
      LET volume = DOCUMENT(parent.end)
      RETURN volume`))
    .then(r => {
      const volume = {
        createdAt: convert(null, 'dateNow'),
        num: !r._result[0] ? 1 : r._result[0].num + 1,
        statType: `${type}Count`,
        title,
        thumbnail,
        type,
        updatedAt: convert(null, 'dateNow')
      };

      return db.query(aql`INSERT ${volume} IN fictions LET new = NEW RETURN new`);
    }).then(volume => {
      newId = volume._result[0]._id;
      let index = -1;
      authors.forEach((a, i) => a.id === userId ? index = i : '');
      index < 0 ? authors.push({ id: userId, positions: ['poster'] }) :
        authors[index].positions = [...authors[index].positions, 'poster'];

      return postAuthors(authors, newId, userId);
    })
    .then(() => postParentTo(newId, parentId))
    .then(() => postNextTo(newId, parentId))
    .then(() => updateFirstAndLast(newId, parentId, 'end'))
    .then(() => postStat(newId, 'volume', {}))
    .then(() => updateStatCount(parentId, `childrenCount`, 1, userId, null))
    .then(() => updateStatCount(userId, `${type}Count`, 1, userId, null))
    .then(() => postUpdates(authors.map(a => a.id), newId, userId))
    .then(() => postUpdates([parentId], newId, userId))
    .then(() => res.status(200).json({ id: parentId, title, type, updated: false }))
    .catch(err => res.status(500).json(handleErrors('POST_VOLUME_ERROR: ', err)));
}

export function postAuthors(a, p, uId) {
  const authors = a;
  const parentId = p;
  const userId = uId;

  return db.query(aql`
    FOR a IN ${authors}
      INSERT { _from: a.id, _to: ${parentId}, positions: a.positions, status: a.id == ${userId} ? '' : 'request',
        permission: POSITION(a.positions, 'author', false) || POSITION(a.positions, 'poster', false) ? 'edit' : '' }
      IN authorOf RETURN true`)
    .then(() => true)
    .catch(err => handleErrors('POST_AUTHORS_ERROR: ', err));
}

// unused
export function postConfirmAuthor(req, res) {
  const userId = MAIN_USER;
  const id = convert(req.body.id, 'authorOfId');
  const errors = validate([id]);

  return (errors.length == 0 ? db.query(aql`LET e = DOCUMENT(${id}) RETURN { from: e._from id: e._id, to: e._to }`) :
    Promise.reject(errors))
    .then(r => r._result.length === 0 ? Promise.reject(DOCUMENT_NOT_FOUND) : r._result[0].from === userId ? 
      db.query(aql`UPDATE { _key: ${r._result[0].id.replace('authorOf/', '')} WITH { status: '' } IN authorOf
      RETURN NEW._to }`) : Promise.reject(NO_PERMISSION))
    .then(r => db.query(aql`LET parent = DOCUMENT(${r._result[0]}) RETURN parent.statType`))
    .then(() => updateStatCount(userId, r._result[0].statType, 1, userId, null))
    .then(() => res.status(200).json(true))
    .catch(err => res.status(500).json(handleErrors('POST_CONFIRM_AUTHORS_ERROR: ', err)));
}

export function postParentTo(id, parentId) {
  return db.query(aql`INSERT { _from: ${parentId}, _to: ${id} } IN parentTo RETURN { id: NEW._id }`)
    .then(() => true)
    .catch(err => handleErrors('POST_PARENT_TO_ERROR: ', err));
}

export function postNextTo(id, parentId){
  return db.query(aql`
    LET parent = DOCUMENT(${parentId})
    LET latest = parent.end || parent.num == 1 ? [parent.end] : (FOR v IN 1 INBOUND parent._id GRAPH 'nextToGraph' RETURN v.end)
    RETURN latest[0]`)
    .then(parent => {
      const latest = parent._result[0] ? parent._result[0] : null;

      return latest ? db.query(aql`INSERT { _from: ${latest}, _to: ${id} } IN nextTo`) : '';
    }).catch(err => handleErrors('POST_NEXT_TO_ERROR: ' , err));
}

export function postReview(req, res){
  const userId = MAIN_USER;
  const rating = convert(req.body.rating, 'bool');
  const title = rating ? '' : convert(req.body.title, 'text');
  const body = rating ? '' : convert(req.body.body, 'richText');
  const style = rating ? null : req.body.style ? convert(req.body.style, 'richText') : null;
  const grammar = rating ? null : style ? convert(req.body.grammar, 'richText') : null;
  const story = rating ? null : style ? convert(req.body.story, 'richText') : null;
  const characters = rating ? null : style ? convert(req.body.characters, 'richText') : null;
  const ratings = style && convert(req.body.ratings, 'ratings').length == 1 ?
    { error: 'Incomplete rating' } : convert(req.body.ratings, 'ratings');
  const parentId = convert(req.body.parentId, 'fictionId');
  const errors = validate([title, body, style, grammar, story, characters, rating, ratings, parentId]);
  const wordCount = !rating ? getWordCount(body) : 50;
  let review = {};
  let statId;
  let newId;

  return (wordCount < 10 ? Promise.reject(NOT_ENOUGH_WORD + '10)') : errors.length != 0 ? Promise.reject(errors) :
    hasPermission(userId, [parentId]))
    .then(p => p.length == 0 || !p[0].includes('fictions') ? Promise.reject(p) : hasReview(userId, parentId))
    .then(r => !r ? db.query(aql`LET p = DOCUMENT(${parentId}) RETURN p.type`) : Promise.reject(ALREADY_POSTED_REVIEW))
    .then(r => {
      if (r._result[0] !== 'book') return Promise.reject('You can only post reviews to books!');
      
      review = {
        createdAt: convert(null, 'dateNow'),
        updatedAt: convert(null, 'dateNow'),
        rating,
        title,
        score: { },
        text: { overall: body },
        type: 'review'
      };

      style ? review.text.style = style : '';
      grammar ? review.text.grammar = grammar : '';
      story ? review.text.story = story : '';
      characters ? review.text.characters = characters : '';

      const types = ['overall', 'style', 'grammar', 'story', 'characters'];
      ratings.forEach((r, i) => review.score[types[i]] = r);
      return db.query(aql`INSERT ${review} IN reviews RETURN { id: NEW._id }`);
    })
    .then(r => {
      newId = r._result[0].id;

      return postAuthors([{ id: userId, positions: ['author'] }], newId, userId);
    })
    .then(() => postStat(newId, 'review'))
    .then(r => { statId = r._result[0]; return updateStatCount(parentId, 'reviewCount', 1, userId, null); })
    .then(() => updateStatCount(userId, 'reviewCount', 1, userId, null))
    .then(() => db.query(aql`INSERT { _from: ${newId}, _to: ${parentId} } IN reviewTo RETURN ''`))
    .then(() => updateRating(ratings, parentId))
    .then(() => db.query(aql`LET u = DOCUMENT(${userId}) RETURN { id: u._id, link: u.link, avatar: u.avatar,
      name: u.displayName }`))
    .then(r => {
      review = {
        comments: {
          [newId]: {
            authorId: userId, date: review.createdAt, down: 0, id: newId, replyCount: 0, score: review.score, statId,
            text: review.text, title, type: 'review', up: 0
          }
        },
        hasReview: true,
        id: newId,
        ids: [newId],
        stats: { [statId]: { down: 0, id: statId, replyCount: 0, up: 0 } },
        statType: `reviewCount`,
        users: { [userId]: r._result[0] },
        value: 1
      };

      res.status(200).json(review)
    })
    .catch(err => res.status(500).json(handleErrors('POST_REVIEW_ERROR: ', err)));
}

// UPDATE ----------------------------------------------------------------------

export function updateAuthors(a, pId, uId, t) {
  const authors = a;
  const parentId = pId;
  const userId = uId;
  const statType = t;
  let oldAuthors;

  return db.query(aql`FOR a, e IN 1 INBOUND ${parentId} GRAPH 'authorsGraph' RETURN { key: e._key, uId: a._id,
      status: e.status }`)
    .then(r => {
      oldAuthors = r._result;
      db.query(aql`
      FOR aO IN ${authors}
      UPSERT { _from: a._id, _to: ${parentId} }
      INSERT { _from: a.id, _to: ${parentId}, positions: a.positions, status: a.id === ${userId} ? '' : 'request',
        permission: CONTAINS(a.position, 'author') || a.position == 'poster' ? 'edit' : '' }
      UPDATE { positions: CONTAINS(a.position, 'author') && ${userId} != a.id ? OLD.positions : a.positions }
      IN authorOf RETURN true`)
    })
    .then(() => db.query(aql`FOR a IN ${oldAuthors.filter(a => !authors.includes(a.uId))} REMOVE a.key IN authorOf
      RETURN a.position == 'request' ? a.uId : null`))
    .then(r => updateStatCount(r._result.filter(a => !a), statType, -1, null))
    .catch(err => handleErrors('POST_AUTHORS_ERROR: ', err));
  }

export function updateFirstAndLast(id, pId, t){
  const type = t;
  const parentId = pId;

  return db.query(aql`
    LET parent = DOCUMENT(${parentId})
    LET doc = DOCUMENT(${id})
    RETURN { start: parent.start, end: parent.end }`)
    .then(r => {
      let update = { [type]: id };
      if (!r._result[0].start) update.start = id;

      return db.query(aql`
        LET doc = DOCUMENT(${parentId})
        UPDATE doc WITH ${update} IN fictions RETURN true
      `);
    }).catch(err => handleErrors('UPDATE_FIRST_AND_LAST_ERROR: ',  err));
}

// unused, old function needs to be rewritten
export function updateNextTo(req, res){
  const userId = "users/3103142";

  if(!userId) return NOT_REGISTERED;

  const id = convert(req.body.id, 'id');

  if(!id) return INVALID_ID;

  return canEdit(userId, id, '')
    .then(r =>  r === true ? db.query(aql`
      LET beforeId = (FOR b IN nextTo FILTER b._to == ${id} RETURN b)
      LET afterId = (FOR a IN nextTo FILTER a.from == ${id} RETURN a)
      LET beforeTarget = (FOR b IN nextTo FILTER b.to == ${target} RETURN b)
      RETURN { beforeId: beforeId, afterId: afterId, beforeTarget: beforeTarget }
    `) : Promise.reject(CANNOT_EDIT)
    )
    .then(r => {
      if(r._result.length == 0) Promise.reject(DOCUMENT_NOT_FOUND);

      if(!r._result.hasOwnProperty("beforeTarget") && !r._result.hasOwnProperty("afterId"))
        return db.query(aql`
          LET beforeId = (FOR b IN nextTo FILTER b._to == ${id} RETURN b)
          FOR n IN nextTo
          FILTER n._id == beforeId[0]._id || n._id == afterId[0]._id
          UPDATE n WITH { _from: ${id}, _to: ${target} }
          RETURN true
        `)
        .then(() => updateFirstAndLast(id, parentId, "start"))
        .then(() => updateFirstAndLast(r._result[0].beforeId._from, parentId, "last"))
        .catch(err => {console.log("UPDATE_NEXT_TO_BOTH_ERROR: " + err); return resetNextTo(r._result);});

      if(!r._result.hasOwnProperty("beforeTarget"))
        return db.query(aql`
          LET beforeId = (FOR b IN nextTo FILTER b._to == ${id} RETURN b)
          LET afterId = (FOR a IN nextTo FILTER a.from == ${id} RETURN a)
          FOR n IN nextTo
          FILTER n._id == beforeId[0]._id || n._id == afterId[0]._id
          UPDATE n WITH { 
            _from: n._id == beforeId[0]._id ? beforeId[0]._from : ${id},
            _to: n._id == beforeId[0]._id ? afterId[0]._to : ${target}
          }
          RETURN true
        `)
        .then(() => updateFirstAndLast(id, parentId, "start"))
        .catch(err => {console.log("UPDATE_NEXT_TO_BEFORETARGET_ERROR: " + err); return resetNextTo(r._result);});

      if(!r._result.hasOwnProperty("afterId"))
        return db.query(aql`
          LET beforeId = (FOR b IN nextTo FILTER b._to == ${id} RETURN b)
          LET beforeTarget = (FOR b IN nextTo FILTER b.to == ${target} RETURN b)
          FOR n IN nextTo
          FILTER n._id == beforeId[0]._id || n._id == beforeTarget[0]._id
          UPDATE n WITH { 
            _from: n._id == beforeId[0]._id ? beforeTarget[0]._from : ${id},
            _to: n._id == beforeId[0]._id ? ${id} : ${target}
          }
          RETURN true
        `)
        .then(() => updateFirstAndLast(r._result[0].beforeId._from, parentId, "last"))
        .catch(err => {console.log("UPDATE_NEXT_TO_AFTERID_ERROR: " + err); return resetNextTo(r._result);});
      
      if(!r._result.hasOwnProperty("beforeId"))
        return db.query(aql`
          LET afterId = (FOR a IN nextTo FILTER a.from == ${id} RETURN a)
          LET beforeTarget = (FOR b IN nextTo FILTER b.to == ${target} RETURN b)
          FOR n IN nextTo
          FILTER n._id == afterId[0]._id || n._id == beforeTarget[0]._id
          UPDATE n WITH { 
            _from: n._id == afterId[0]._id ? beforeTarget[0]._from : ${id},
            _to: n._id == afterId[0]._id ? ${id} : ${target} 
          }
          RETURN true
        `)
        .then(() => updateFirstAndLast(r._result[0].afterId._to, parentId, "start"))
        .catch(err => {console.log("UPDATE_NEXT_TO_BEFOREID_ERROR: " + err); return resetNextTo(r._result);});

      return db.query(aql`
        LET beforeId = (FOR b IN nextTo FILTER b._to == ${id} RETURN b)
        LET afterId = (FOR a IN nextTo FILTER a.from == ${id} RETURN a)
        LET beforeTarget = (FOR b IN nextTo FILTER b.to == ${target} RETURN b) 
        FOR n IN nextTo
        FILTER n._id == afterId[0]._id || n._id == beforeTarget[0]._id
        UPDATE n WITH { 
          _from: n._id == beforeId[0]._id ? n._from : n._id == afterId[0]._id ? beforeTarget[0]._from : ${id},
          _to: n._id == beforeId[0]._id ? afterId._to : n._id == afterId[0]._id ? ${id} : ${target} 
        }
        RETURN true
      `)
      .then(() => true)
      .catch(err => console.log("UPDATE_NEXT_TO_BEFOREID_ERROR: " + err));
    })
    .then(r => {

    }).catch(err => console.log("UPDATE_NEXT_TO_ERROR: " + err));
}

//export function resetNextToParent(data){ }

// unused
export function updateFiction(req, res) {
  const userId = MAIN_USER;
  const id = convert(req.body.id, 'fictionId');
  const title = convert(req.body.title, 'title');
  const type = convert(req.body.type, 'parentType');
  const parentId = req.body.parentId ? convert(req.body.parentId, 'fictionId') : null;
  const draft = convert(req.body.draft, 'bool');
  let authors = convert(req.body.authors, 'authors');
  const thumbnail = convert(req.body.authors, 'thumbnail');
  const errors = validate([id, title, type, parentId, draft, authors, thumbnail]);
  let statType;

  return (errors.length != 0 ? Promise.reject(errors.join('\n')) : canEdit(userId, parentId ? parentId : id, ''))
    .then(r => !r ? Promise.reject(CANNOT_EDIT) : db.query(aql`FOR p IN 1 INBOUND ${id} GRAPH 'parentsGraph' RETURN ''`))
    .then(r => {
      if (r.length != 0) return Promise.reject('Sorry, you can\'t currently change  the parent to a fiction.');

      const fiction = {
        createdAt: convert(null, 'dateNow'),
        updatedAt: convert(null, 'dateNow'),
        title,
        draft,
        thumbnail
      };

      return db.query(aql`INSERT ${fiction} IN fictions LET new = NEW RETURN new`);
    })
    .then(r => { statType = r._result[0].statType;
      return updateAuthors(authors, newId, userId, `${r._result[0].type}Count`);})
    .then(() => parentId && postParentTo(newId, parentId))
    .then(() => parentId && postNextTo(newId, parentId))
    .then(() => parentId && updateStatCount(parentId, statType, 1, userId, null))
    .then(() => parentId && updateFirstAndLast(newId, parentId, 'end'))
    .then(() => parentId && postUpdates([id], newId, userId))
    .then(() => res.status(200).json({ id, title, updated: true }))
    .catch(err => res.status(500).json(handleErrors('UPDATE_PARENT_ERROR: ', err)));
}

// unused
export function updateBook(req, res) {
  const userId = MAIN_USER;
  const id = convert(req.body.id, 'fictionId');
  const title = convert(req.body.title, 'title');
  const parentId = req.body.parentId ? convert(req.body.parentId, 'fictionId') : null;
  const categories = convert(req.body.categories, 'categories');
  const tags = convert(req.body.tags, 'tags');
  const schedule = convert(req.body.schedule, 'schedule');
  const scheduleType = convert(req.body.scheduleType, 'scheduleType');
  const followerChapters = convert(req.body.followerChapters, 'followerChapters');
  const draft = convert(req.body.draft, 'bool');
  const authors = convert(req.body.authors, 'authors');
  const authorNote = convert(req.body.authorNote, 'richText');
  const body = convert(req.body.body, 'richText');
  const thumbnail = convert(req.body.authors, 'thumbnail');
  const errors = validate([id, title, parentId, categories, tags, schedule, followerChapters, draft, authors,
    authorNote, body, thumbnail]);
  const wordCount = getWordCount(body);

  return (wordCount < 15 ? Promise.reject(NOT_ENOUGH_WORD + '15)') : errors.length != 0 ?
    Promise.reject(errors.join('\n')) : parentId ? canEdit(userId, parentId, '') : true)// can edit the chosen parent?
    .then(r => !r ? Promise.reject(CANNOT_EDIT) : canEdit(userId, id, ''))// can edit the book itself?
    .then(r => !r ? Promise.reject(CANNOT_EDIT) : db.query(aql`FOR p IN 1 INBOUND ${id} GRAPH 'parentsGraph' RETURN ''`))
    .then(r => {
      if (r.length != 0) return Promise.reject('Sorry, you can\'t currently change the parent of a book.');// has parent

      let frequency = 0;
      schedule.forEach(s => frequency += s[0] + s[1]);
      const fiction = {
        createdAt: convert(null, 'dateNow'),
        updatedAt: convert(null, 'dateNow'),
        title,
        categories,
        tags,
        schedule,
        scheduleType,
        followerChapters,
        draft,
        autoIndex,
        authorNote,
        body,
        frequency,
        thumbnail
      };

      return db.query(aql`UPDATE { _key: ${id.replace('fictions/', '')} } WITH ${fiction} IN fictions RETURN NEW`);
    })
    .then(r => { statType = r._result[0].statType;
      return updateAuthors(authors, newId, userId, `${r._result[0].type}Count`);
    })
    .then(() => parentId && postParentTo(newId, parentId))
    .then(() => parentId && postNextTo(newId, parentId))
    .then(() => parentId && updateFirstAndLast(newId, parentId, 'end'))
    .then(() => parentId && postUpdates([parentId], id, userId))
    .then(() => res.status(200).json({ id, title, updated: true }))
    .catch(err => res.status(500).json(handleErrors('UPDATE_BOOK_ERROR: ', err)));
}

export function updateReview(req, res) {
  const userId = MAIN_USER;
  const id = convert(req.body.id, 'reviewId');
  const rating = convert(req.body.rating, 'bool');
  const title = rating ? '' : convert(req.body.title, 'text');
  const body = rating ? '' : convert(req.body.body, 'richText');
  const style = rating ? null : req.body.style ? convert(req.body.style, 'richText') : null;
  const grammar = rating ? null : style ? convert(req.body.grammar, 'richText') : null;
  const story = rating ? null : style ? convert(req.body.story, 'richText') : null;
  const characters = rating ? null : style ? convert(req.body.characters, 'richText') : null;
  const ratings = style && convert(req.body.ratings, 'ratings').length == 1 ?
    { error: 'Incomplete rating' } : convert(req.body.ratings, 'ratings');
  const parentId = convert(req.body.parentId, 'fictionId');
  const errors = validate([id, title, body, style, grammar, story, characters, rating, ratings, parentId]);
  const wordCount = !rating ? getWordCount(body) : 50;
  let review = {};
  let oldRating;
  const types = ['overall', 'style', 'grammar', 'story', 'characters'];
  
  return (wordCount < 10 ? Promise.reject(NOT_ENOUGH_WORD + '10)') : errors.length != 0 ? Promise.reject(errors) :
    canEdit(userId, id, ''))
    .then(r => {
      if (!r) Promise.reject(CANNOT_EDIT);

      if (!rating) {
        review = {
          updatedAt: convert(null, 'dateNow'),
          title,
          score: {},
          text: { overall: body }
        };

        style ? review.text.style = style : '';
        grammar ? review.text.grammar = grammar : '';
        story ? review.text.story = story : '';
        characters ? review.text.characters = characters : '';
      } else review = { updatedAt: convert(null, 'dateNow'), score: {} };


      ratings.forEach((r, i) => review.score[types[i]] = r);

      return db.query(aql`UPDATE { _key: ${id.replace('reviews/', '')} } WITH ${review} IN reviews RETURN OLD`);
    })
    .then(r => {
      oldRating = types.map(t => r._result[0].score[t] ? r._result[0].score[t] : 0);

      return db.query(aql`FOR s IN 1 INBOUND ${parentId} GRAPH 'statsGraph' RETURN s`);
    })
    .then(r => {
      const newRating = r._result[0].ratings.map((t, i) => t.map((n, j) => (j + 1) === oldRating[i] ? n - 1 : n));
      return db.query(aql`UPDATE { _key: ${r._result[0]._key} } WITH { ratings: ${newRating} } IN statistics RETURN ''`);
    })
    .then(() => updateRating(ratings, parentId))
    .then(() => {
      review = { score: review.score, text: review.text, id };

      res.status(200).json(review)
    })
    .catch(err => res.status(500).json(handleErrors('UPDATE_REVIEW_ERROR: ', err)));
}

// REMOVE ----------------------------------------------------------------------


// export function removeAuthors(req, res) { }

// unused & old
export function removeNextTo(id, target, parentId){
  return db.query(aql`
    LET to = (FOR t IN nextTo FILTER t._from == ${id} RETURN t)
    LET from = (FOR f IN nextTo FILTER f.to == ${id} RETURN f)
    RETURN { to: to, from: from }
    `)
    .then(r => {
      if(r._result.length == 0) Promise.reject(DOCUMENT_NOT_FOUND);
      if(!r._result.hasOwnProperty("to")) return updateFirstAndLast(r._result[0].from._from, parentId, "last");
      if(!r._result.hasOwnProperty("from")) return updateFirstAndLast(r._result[0].to._to, parentId, "start");

      return db.query(aql`LET f = DOCUMENT(${r._result[0].from._from}) UPDATE f WITH { _to: ${r._result[0].to._to} }
      IN nextTo`)
    }).catch(err => console.log("UPDATE_NEXT_TO_ERROR: " + err));
}


// OTHER -----------------------------------------------------------------------

export function hasReview(uId, pId) {
  const userId = uId;
  const parentId = pId;
  
  return db.query(aql`
    LET reviews = (FOR r IN 1 OUTBOUND ${userId} GRAPH 'authorsGraph'
      FILTER r.type == 'review'
        LET review = (FOR f IN 1 OUTBOUND r._id GRAPH 'reviewsGraph' FILTER f._id == ${parentId} RETURN f)
      FILTER LENGTH(review) > 0
      RETURN r
    )
    RETURN LENGTH(reviews) > 0 ? reviews[0] : false`)
    .then(r => r._result[0] ? r._result[0] : false)
    .catch(err => handleErrors('HAS_REVIEW_ERROR: ', err))
}


// 
export default {
  getAllAuthors,
  getAuthors,
  getBook,
  getChildren,
  getChooseParent,
  getDashboard,
  getHome,
  getReviews,
  getSubmit,
  getUniverse,
  postParent,
  postAuthors,
  postNextTo,
  postBook,
  postReview,
  postVolume,
  updateBook,
  updateStatCount,
  updateFirstAndLast,
  updateReview
};