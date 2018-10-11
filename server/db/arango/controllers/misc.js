import db from '../connect';
import { aql } from 'arangojs';
import showdown from 'showdown';
import striptags from 'striptags';
import { sanitize } from '../../../../app/utils/misc';
import {
  ALREADY_POSTED_REVIEW,
  ALREADY_RATED,
  CANNOT_EDIT,
  CHAPTER_NOT_FOUND,
  DOCUMENT_NOT_FOUND,
  INVALID_ID,
  FICTION_NOT_FOUND,
  MAIN_USER,
  NO_PARENT_FOR_REVIEW,
  NO_PERMISSION,
  NOT_REGISTERED,
  PUBLIC_ID,
  NO_COMMENTS,
  NO_AUTHORS,
  NO_CHILDREN,
  NO_MORE_CHILDREN,
  NO_REVIEWS,
  NO_STATS,
  USER_NOT_FOUND
} from './constants';
import { hasPermission } from './user';

function getWeek (d) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
    - 3 + (week1.getDay() + 6) % 7) / 7);
}

export function toObject(arr, key) {
  return arr === null || arr.length == 0 ? {} : Object.assign({}, ...arr.map(item => ({ [item[key]]: item })));
}

export function handleErrors(text, e) {
  const isObject = typeof e == 'object';
  let err;
  if (isObject) {
    try {
      err = JSON.stringify(e);
    } catch (error) {
      err = Object.keys(e);
      if(err.length != 0) err = err.join(', ');
    }
  } else {
    err = e;
  }

  console.error(`--------------------- HANDLE_ERROR ---------------------`);
  console.error(`${text}${err}`);
  console.error(`--------------------- HANDLE_ERROR ---------------------`);
  return err;
}

export function getPopularity(s) {
  return s.views.uniques.complete;
}

function getAverageView(num, d) {
  const date = (new Date(Date.now) - new Date(d))/1000/60/60/24; // time passed since creation (in days)

  return date > 0 ? num/date : num;
}

// export function getMyRatings(req, res) {}

export function getRatings(id, user) {
  const userId = user;
  
  return db.query(aql`
    FOR v, e IN 1 INBOUND ${id} GRAPH 'ratingsGraph'
    FILTER e._from == ${userId}
    RETURN { id: e._key, type: e.type }
  `)
  .catch(err => handleErrors('GET_RATINGS_ERROR: ', err));
}

export function getStats(cId, type, views){
  const ids = cId;
  let statistics = {};
  return db.query(aql`
      LET stats = (FOR sT IN statTo
      FILTER sT._to IN ${ids}
        FOR s IN statistics
        FILTER s._id == sT._from
        LET pop = ${type} == 'book' ? (FOR s2 IN statistics SORT s2.popularity DESC FILTER s2.popularity > s.popularity
          RETURN true) : null
        RETURN MERGE(UNSET(s, 'views', 'popularity', 'ratings'), { popularity: pop ? LENGTH(pop)+1 : null },
          { ratings: ${views} ? s.ratings : '' }, { views: ${views} ? s.views : s.views.complete.complete },
          { to: sT._to })
      )
      RETURN { stats, ids: stats[*]._id, to: stats[*].to }
    `)
    .then(stat => {
      if(stat._result.length === 0) return Promise.reject(NO_STATS);
      statistics.stats = toObject(stat._result[0].stats, '_id');
      statistics.ids = stat._result[0].ids;
      statistics.to = stat._result[0].to;

      return statistics;
    })
    .catch(err => handleErrors('GET_STATS_ERROR: ' + err));
}


// POST ------------------------------------------------------------------------

export function postRating(req, res){
  const userId = MAIN_USER;
  const type =
    req.body.id.includes('fictions/') ? 'fiction' : req.body.id.includes('articles/') ? 'article' :
    req.body.id.includes('comments/') ? 'comment' : req.body.id.includes('reviews/') ? 'review' :
    req.body.id.includes('users/') ? 'user' : '';
  const parentId = convert(req.body.id, `${type}Id`);
  const rType = convert(req.body.type, 'ratingType');

  const errors = validate([parentId, rType, type]);

  const rating = { _from: userId, _to: parentId, type: rType, createdAt: convert(null, 'dateNow') }

  return (errors.length != 0 ? Promise.reject(errors) : parentId.includes('users') ? Promise.resolve([parentId]) :
    hasPermission(userId, [parentId]))
    .then(p => p.length == 0 || p[0] !== parentId ? Promise.reject(p) : db.query(aql`
      LET a = DOCUMENT(${parentId})._id
      LET r = (
        FOR v, e IN 1 OUTBOUND ${userId} GRAPH 'ratingsGraph'
        FILTER e._to == ${parentId} && e.type == ${rType}
        RETURN true
      )
      LET c = (
        FOR v, e IN 1 OUTBOUND ${userId} GRAPH 'ratingsGraph'
        FILTER e._to == ${parentId} && ((${rType} == 'up' && e.type == 'down') || (${rType} == 'down' && e.type == 'up'))
        RETURN true
      )

      RETURN { a: LENGTH(a) == 0 ? null : a, r: LENGTH(r) == 0 ? false : true, c: LENGTH(c) == 0 ? false : true,
        cId: LENGTH(c) != 0 ? c._id : null }
      `)
    )
    .then(r =>
      r._result[0].a == null ? Promise.reject(DOCUMENT_NOT_FOUND) :
      r._result[0].r === true ? Promise.reject(ALREADY_RATED) :
      r._result[0].c === true ? Promise.reject(ALREADY_RATED) :
      db.query(aql`INSERT ${rating} IN ratingTo RETURN NEW`))
    .then(r => updateStatCount(parentId, rType, 1, userId, r._result[0]._id))
    .then(r => res.status(200).json(r))
    .catch(err => res.status(500).json(handleErrors('POST_RATING_ERROR: ', err)));
}


export function postStat(id, t, extra) {
  const type = t;

  let statistic = { createdAt: convert('', 'dateNow'), down: 0, up: 0 };
  // add for users
  if (type === 'comment') statistic.replyCount = 0;
  else if (type === 'review') statistic = { ...statistic, replyCount: 0 }
  else if (type === 'volume') statistic = { articleCount: 0, createdAt: convert('', 'dateNow'), chapterCount: 0 }
  else {
    statistic = {
    ...statistic,
    ...{
      commentCount: 0,
      mainCommentCount: 0,
      views: {
        complete: {
          complete: 0,
          yearly: 0,
          monthly: 0,
          weekly: 0,
          daily: 0,
          averages: 0
        },
        uniques: {
          complete: 0,
          yearly: 0,
          monthly: 0,
          weekly: 0,
          daily: 0,
          averages: 0
        }
      },
      wordCount: 0
    },
    ...extra
    };
  }

  if (type === 'chapter') statistic = { ...statistic, typoCount: 0, thanks: 0 };
  if (type === 'fiction') {
    statistic = {
      ...statistic,
      ...{
        chapterCount: 0, articleCount: 0, childrenCount: 0, ratingsCount: 0, reviewCount: 0, typoCount: 0, favorite: 0,
        follow: 0, rating: Array(5).fill(0), ratings: Array(5).fill(Array(10).fill(0)), subscribers: 0, donations: 0,
        pages: 0, popularity: 0
      }
    };
  }

  return db.query(aql`INSERT ${statistic} IN statistics RETURN { id: NEW._id }`)
    .then(r => db.query(aql`INSERT { _from: ${r._result[0].id}, _to: ${id} } IN statTo RETURN ${r._result[0].id}`))
    .catch(err => handleErrors('POST_STAT_TO_ERROR:',  err));
}

export function addView(parentId, id, stats, vId, vType){
  let unique = false;
  const now = new Date(Date.now());
  const year = now.getFullYear();
  const month = now.getMonth()+1;
  const week = getWeek(now);
  const day = now.getDate();

  return db.query(aql`
      UPSERT { createdAt: ${day}, parentId: ${parentId}, type: 'view', visitor: ${vId} }
      INSERT { createdAt: ${day}, count: 1, parentId: ${parentId}, type: 'view', visitorType: ${vType}, visitor: ${vId} }
      UPDATE { createdAt: ${day}, count: OLD.count + 1 } IN views
      RETURN OLD ? false : true
    `)
    .then(r => { // should probably do it in a different way, not mass deleting
      unique = r._result[0];
      return db.query(aql`
        FOR v IN views
        FILTER v.type == 'view' && v.createdAt != ${day}
        REMOVE v IN views
      `);
    })
    .then(() => { // update statistics (reset if needed)
      const sDate = new Date(stats.updatedAt);
      const sYear = sDate.getFullYear();
      const sMonth = sDate.getMonth()+1;
      const sWeek = getWeek(sDate);
      const sDay = sDate.getDate();
      const uniqueViews = unique ? {
        complete: ++stats.views.uniques.complete,
        yearly: year === sYear ? ++stats.views.uniques.yearly : 0,
        monthly: month === sMonth ? ++stats.views.uniques.monthly : 0,
        weekly: week === sWeek ? ++stats.views.uniques.weekly : 0,
        daily: day === sDay ? ++stats.views.uniques.daily : 0,
        averages: getAverageView(stats.views.uniques.averages, stats.createdAt)
      } : stats.views.unique;
      const allViews = {
        complete: ++stats.views.complete.complete,
        yearly: year === sYear ? ++stats.views.complete.yearly : 0,
        monthly: month === sMonth ? ++stats.views.complete.monthly : 0,
        weekly: week === sWeek ? ++stats.views.complete.weekly : 0,
        daily: day === sDay ? ++stats.views.complete.daily : 0,
        averages: getAverageView(stats.views.complete.averages, stats.createdAt)
      };
      const views = {
        updatedAt: now.getTime(),
        views: {
          uniques: uniqueViews,
          complete: allViews
        }
      };

      return db.query(aql`
        LET s = DOCUMENT(${id})
        UPDATE s WITH ${views} IN statistics
      `);
    })
    .then(() => { // save view to yearly view statistic (views -> fictions, etc)
      const view = {
        createdAt: now.getTime(),
        complete: 1,
        year: year,
        months: {
          [month]: 1
        },
        weeks: {
          [week]: 1
        },
        days: {
          [month]: {
            [day]: 1
          }
        }
      }
      return unique ? db.query(aql`
        LET view = (FOR v IN 1 INBOUND ${parentId} GRAPH 'viewsGraph' FILTER v.year == ${year} RETURN v._id)
        UPSERT { _id: view[0] } 
        INSERT ${view} 
        UPDATE { 
          complete: OLD.complete + 1, 
          months: OLD ? { [${month}]: OLD.months[${month}] ? OLD.months[${month}] + 1 : 1 } : '', 
          weeks: OLD ? { [${week}]: OLD.weeks[${week}] ? OLD.weeks[${week}] + 1 : 1 } : '', 
          days: OLD ? { [${month}]: { [${day}]: OLD.days[${month}][${day}] ? OLD.days[${month}][${day}] + 1 : 1 } } : '',
          updatedAt: ${now.getTime()}
        } IN views
        RETURN { id: OLD ? null : NEW._id }
      `) : { ['_result']: [{id: null}] };
    })
    .then(r => r._result[0].id !== null && db.query(aql`INSERT { _from: ${r._result[0].id}, _to: ${parentId} } IN viewTo
      RETURN true`))
    .then(() => updatePopularity(id))
    .catch(err => handleErrors('ADD_VIEW_ERROR: ', err));
} 

export function updateStatCount(id, type, increment, userId, ratingId) {
  const ids = Array.isArray(id) ? id : [id];

  return db.query(aql`
      FOR id IN ${ids}
        FOR sT IN statTo
        FILTER sT._to == id
          FOR s IN statistics
          FILTER s._id == sT._from
          UPDATE s WITH { ${type}: s[${type}] || s[${type}] == 0 ? s[${type}] + ${increment} : 1 } 
          IN statistics RETURN { old: s[${type}], id: s._id }
    `)
    .then(r => ({id, ratingId, statId: r._result[0].id, type, userId, value: increment }))
    .catch(err => handleErrors('UPDATE_STAT_COUNT_ERROR: ',  err));
}

export function updatePopularity(sId) {
  const id = sId;
  let statistics = {};

  return db.query(aql`RETURN DOCUMENT(${id})`)// should probably just pass the updated stat object to avoid this step
    .then(r => {
      statistics = r._result[0];
      const popularity = getPopularity(statistics);

      return db.query(aql`UPDATE DOCUMENT(${id}) WITH { popularity: ${popularity} } IN statistics RETURN true`);
    })
    .catch(err => handleErrors('UPDATE_POPULARITY_ERROR: ' + err));
}

export function updateRating(r, pId) {
  const rating = r.length != 5 ? [r[0], 0, 0, 0, 0] : r;
  const parentId = pId;
  
  return db.query(aql`
      FOR s IN 1 INBOUND ${parentId} GRAPH 'statsGraph' RETURN { key: s._key, rating: s.rating, ratings: s.ratings }`) 
    .then(r => {
      const ratings = r._result[0].ratings.map((t, i) => t.map((r, j) => (j+1) === rating[i] ? r + 1 : r));
      const count = ratings.map(r => r.reduce((a, v) => a + v));
      const average = ratings.map((r, i) => count[i] === 0 ? 0 : r.reduce((a, v, j) => a + (v * (j + 1))) / count[i])
        .map(a => parseFloat(a.toFixed(2), 10));
      db.query(aql`UPDATE { _key: ${r._result[0].key} }
      WITH { rating: ${average}, ratings: ${ratings} } IN statistics RETURN true`)
    })
    .catch(err => handleErrors('UPDATE_RATING_ERROR: ', err));
}

export function report(req, res) {
  const userId = MAIN_USER;
  const type = convert(req.body.type, 'idType');
  const id = typeof type !== 'object' ? convert(req.body.id, type) : '';// if type is valid
  const reason = convert(req.body.reason, 'reportReason');
  const errors = validate([type, id, reason]);

  return (errors.length != 0 ? Promise.reject(errors) : Promise.resolve(''))
    .then(() => db.query(aql`LET d = DOCUMENT(${id}) RETURN d._id`))
    .then(r => r._result.length == 0 ? Promise.reject(DOCUMENT_NOT_FOUND)
      : db.query(aql`FOR c IN INBOUND SHORTEST_PATH ${id} TO ${userId} GRAPH 'reportsGraph' RETURN c._id`))
    .then(r => r._result.length != 0 ? Promise.reject(`You've already reported it!`)
      : db.query(aql`INSERT { _from: ${userId}, _to: ${id}, reason: ${reason} } IN reportTo RETURN true`))
    .then(() => res.status(200).json(true))
    .catch(err => res.status(500).json(handleErrors('REPORT_ERROR: ', err)));
}

export function convert(from, to){
  switch (to) {
    case 'dateNow': return Date.now();
    case undefined: return null;
    case 'bool': return typeof from === 'boolean' ? from : from === 'true' ? true : from === 'false' ? false :
      { error: 'INVALID BOOLEAN' };
    case 'authors': 
      let mainAuthor = -1;
      let users = [];
      const positions = ['main-author', 'co-author', 'betareader', 'editor', 'proofreader', 'other'];
      
      from.forEach((u, i) => {
        let exists = -1;
        users.forEach((a, i) => { if (a.id === u.id) exists = i; });
        const toAdd = u;
        const added = [];
        toAdd.positions = u.positions.map(p => {
          if(positions.includes(p)) {
            if (added.includes(p)) {
              return null;
            } else {
              added.push(p);
              return p;
            }
          } else if (u.positions.includes('other') || p === 'poster') {
            return null;
          } else {
            return 'other';
          }
        }).filter(p => p !== null);

        if (exists !== -1) {
          users[exists] = { ...users[exists], positions: [...users[exists].positions, ...u.positions.
            filter(p => !users[exists].positions.includes(p))] }
        } else {
          if (u.positions.includes('main-author')) {
            if (mainAuthor === -1) {
              mainAuthor = i;
            }else if (u.positions.length == 1) {
              return false;
            } else {
              toAdd.positions = toAdd.positions.filter(p => p !== 'main-author');
            }
          }
          users.push(toAdd);
        }
      });

      return users.length == 0 ? { error: USER_NOT_FOUND } : users;
    case 'categories': {
      if (!Array.isArray(from)) return { error: 'Invalid value for categories: *not an array*' };
      const list = ['ACTION', 'ADVENTURE', 'COMEDY', 'CRIME', 'DRAMA', 'FANTASY', 'HISTORICAL', 'HORROR', 'MYSTERY',
        'ROMANCE', 'SCI-FI', 'SLICE OF LIFE', 'THRILLER', 'WESTERN', 'XIANXIA', 'XUANHUAN'];
      const categories = from.map(c => c.toUpperCase()).filter(c => list.includes(c));
      return categories.length > 2 ? categories : { error: 'You need to add at least 3 categories.' };
    }
    case 'commentType': return from === 'typo' ? from : 'comment';
    case 'conversationType': return ['inbox', 'starred', 'trashed'].includes(from) ? from :
      { error: 'Invalid inbox filter' };
    case 'followerChapters':
      const num = parseInt(from, 10);
      return isNaN(num) || num < 0 || num > 5 ? { error: 'Follower-only chapters can only be between 0-5.' } : num;
    case 'idType':
      return ['article', 'comment', 'conversation', 'fiction', 'list', 'review', 'user'].includes(from) ? from : 
        { error: 'Invalid ID type.' };
    case 'int':{
      const num = parseInt(from, 10)
      return isNaN(num) ? { error: 'Not a number!' } : num;
    }
    case 'offset':
      const offset = parseInt(from, 10);
      return !isNaN(offset) ? offset : { error: 'Offset is not a number.' };
    case 'parentType': return ['articles', 'fictions'].includes(from) ? from : { error: INVALID_ID };
    case 'positions': {
      if (!Array.isArray(from)) return { error: 'Author\'s position is invalid.' };
      if (from.length == 0) return { error: 'You didn\'t add a positions to the author.' };

      const positions = ['main-author', 'co-author', 'betareader', 'editor', 'proofreader', 'other'];
      const valid = from.map(p => positions.includes(p) ? true : false);
      return !valid.includes(false) ? from : { error: 'Author\'s position is invalid.' };
    }
    case 'ratings':{
      if (!Array.isArray(from)) return { error: 'Invalid type of ratings.' };
      const ratings = from.filter(r => r > 0);
      return ratings.length == 0 ? { error: 'Invalid ratings' } : ratings.length != 1 && ratings.length != 5 ? 
        { error: 'Invalid number of ratings: rate only overall, or all five.' } : ratings;
    }
    case 'reportReason':
      return ['spamming', 'flaming', 'hate speech'].includes(from) ? from : { error: 'Invalid reason for reporting.' };
    case 'richText':
      return Array.isArray(from) && from.length > 0 ? from :
      { error: 'Invalid type of rich text or it has less than a single word.' };
    case 'schedule':
      // todo: don't allow more than a certain ratio of sponsored chapters compared to regulars
      if (!Array.isArray(from)) return { error: 'Invalid value for schedule: *not an array*' };
      if (from.length != 7) return { error: 'Invalid value for schedule: *missing day(s)*' };
      if (from.map(f => f.length == 2 ? true : false).includes(false))
        return { error: 'Invalid value for schedule: *regular and/or sponsored chapter(s) is/are missing*' };

      const schedule = from.map(f => {
        const num = [parseInt(f[0], 10), parseInt(f[1], 10)];
        return isNaN(num[0]) && isNaN(num[1]) ? [0, 0] : isNaN(num[0]) ? [0, num[1]] : isNaN(num[1]) ? [num[0], 0] : num;
      });

      return schedule;
    case 'scheduleType': return ['weekly', 'bi-weekly', 'monthly'].includes(from) ? from : 'weekly';
    case 'tags': 
      if (!typeof from === 'string') return { error: 'Invalid value for tags: *not a string*' };
      const tags = from.split(',').map(t => t.trim()).filter(t => t !== '' && t.length > 2 && t.length < 25);
      return tags.length > 2 ? tags.join(', ') : { error: 'You need to add at least 3 valid tags (tags should be' +
      ' between 3 and 24 characters long.)' };
    case 'text':
    case 'title': 
      return typeof from !== 'string' ? { error: 'Invalid text' } : from.length > 2 ? from : { error: `${to} should be at least 3 characters long.` };
    case 'thumbnail': return 'none';
    case 'Id': return { error: INVALID_ID };
    case 'articleId': return check(from, 'articles/');
    case 'authorOfId': return check(from, 'authorOf/');
    case 'chapterId': return check(from, 'articles/');
    case 'connectedToId': return check(from, 'connectedTo/');
    case 'conversationId': return check(from, 'conversations/');
    case 'commentId': return check(from, 'comments/');
    case 'commentIds':{
      if (!Array.isArray(from)) return { error: 'Not an array!' };
      const ids = from.map(id => check(id, 'comments/'));
      const errors = validate(ids);
      return errors.length != 0 ? { error: INVALID_ID } : ids;
    }
    case 'listId': return check(from, 'lists/');
    case 'fictionId': return check(from, 'fictions/');
    case 'ratingId': return check(from, 'ratingTo/');
    case 'reviewId': return check(from, 'reviews/');
    case 'reviewIds':{
      if (!Array.isArray(from)) return { error: 'Not an array!' };
      const ids = from.map(id => check(id, 'reviews/'));
      const errors = validate(ids);
      return errors.length != 0 ? { error: INVALID_ID } : ids;
    }
    case 'userId': return check(from, 'users/');
    default: return from;
  }
}

function check(w, t) {
  const what = w;
  const to = t;
  if (!what) return { error: INVALID_ID };

  if (to.includes('/')) {
    const num = parseInt(what.replace(to, ''), 10);
    return isNaN(num) || num.length < 4 ? { error: INVALID_ID } : to + num;
  }
}

export function validate(k) {
  const vars = k;
  let errors = [];
  vars.forEach(v => v !== null && typeof v === 'object' && v.error ? errors.push(v.error) : '');
  return errors;
}

export function getWordCount(t) {
  const converter = new showdown.Converter({
    strikethrough: true, tables: true, ghCodeBlocks: true, simpleLineBreaks: true
  });
  let reconstructed = '';
  t.forEach(l => reconstructed += l !== '' ? l + `
` : `
`);
  const text = striptags(sanitize(converter.makeHtml(reconstructed))).replace(/[\W_]+/g, ' ').
    replace(/\s\s+/g, ' ').trim();
  return text.split(' ').length;
}

// REMOVE ----------------------------------------------------------------------


export function removeRating(req, res){
  const userId = MAIN_USER;
  const ratingId = convert(req.body.rId, 'ratingId');
  const errors = validate([ratingId]);

  return (errors.length != 0 ? Promise.reject(errors) : Promise.resolve(''))
    .then(() => 
      db.query(aql`
        FOR r IN ratingTo
        FILTER r._id == ${ratingId} && r._from == ${userId}
        REMOVE r IN ratingTo
        RETURN { id: OLD._to, type: OLD.type}`))
    .then(r => r._result.length != 0 ? updateStatCount(r._result[0].id, r._result[0].type, -1, userId, ratingId) 
      : Promise.reject(DOCUMENT_NOT_FOUND))
    .then(r => res.status(200).json(r))
    .catch(err => res.status(500).json(handleErrors('REMOVE_RATING_ERROR: ', err)));
}

export function notImplemented(req, res) {
  return res.status(500).json('Sorry, this page or function is not yet implemented!');
}

export default {
  addView,
  getWordCount,
  notImplemented,
  postRating,
  removeRating,
  report,
  validate
};