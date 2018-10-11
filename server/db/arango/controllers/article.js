import db from '../connect';
import { aql } from 'arangojs';
import { getComments } from './comment';
import { getAllAuthors, getAuthors, postAuthors, postParentTo, postNextTo, updateFirstAndLast } from './fiction';
import { addView, convert, getRatings, getStats, getWordCount, handleErrors, postStat, toObject, updateStatCount,
  validate } from './misc';
import { canEdit, hasPermission, markUpdates, postPermissions, postUpdates } from './user';
import { CANNOT_EDIT, DOCUMENT_NOT_FOUND, FOLLOWER_ONLY, MAIN_USER, NO_COMMENTS, NO_PARENT_FOR_ARTICLE, NO_PERMISSION,
  NOT_ENOUGH_WORD, NOT_REGISTERED } from './constants';


// GET -------------------------------------------------------------------------

export function getChapterLink(id) {// Only used after postArticle
  return db.query(aql`
    LET article = DOCUMENT(${id})
    LET parents = (
      FOR p IN 2 INBOUND article._id GRAPH 'parentsGraph'
        FOR s IN 1 INBOUND p._id GRAPH 'statsGraph'
        RETURN { id: ${id}, book: p.title, title: article.title, num: article.type == 'chapter' ? s.chapterCount : s.articleCount, type: 'chapter', updated: false }
    )
    RETURN parents[0]`)
  .then(r => r._result[0])
  .catch(err => handleErrors('GET_CHAPTER_LINK_ERROR:', err));
}

export function getArticle(req, res) {
  const userId = MAIN_USER;
  const ip = req.ip;
  const vId = userId ? userId : ip;
  const vType = userId ? "user" : "ip";
  const id = convert(req.params.id, 'articleId');
  let article = {};

  hasPermission(userId, [id])
    .then(p => { // check if user has permission
      if (p[0] === DOCUMENT_NOT_FOUND) return Promise.reject(p[0]);
      if (p[0] === FOLLOWER_ONLY) return FOLLOWER_ONLY;
      if (p.length == 0 || !p[0].includes('articles/')) return Promise.reject(p);
  
      return db.query(aql`
        LET article = DOCUMENT(${id})
        
        LET parents = LENGTH(article) == 0 ? null : (
          FOR p IN 1..4 INBOUND article._id GRAPH 'parentsGraph'
            RETURN { id: p._id, title: p.title, end: p.end, num: p.num, start: p.start }
        )
        LET startVolume = LENGTH(article) == 0 ? null : DOCUMENT(parents[1].start)
        LET endVolume = LENGTH(article) == 0 ? null : DOCUMENT(parents[1].end)
        LET previous = LENGTH(article) == 0 || startVolume.start == ${id} ? null : (
          FOR a IN 1 INBOUND ${id} GRAPH 'nextToGraph'
            RETURN LENGTH(a) == 0 ? null : { id: a._id, title: a.title }
        )
        LET next = LENGTH(article) == 0 || endVolume.end == ${id} ? null : (
          FOR a IN 1 OUTBOUND ${id} GRAPH 'nextToGraph'
            RETURN LENGTH(a) == 0 ? null : { id: a._id, title: a.title }
        )
        LET num = LENGTH(article) == 0 ? null : !article.autoIndex ? '' : (
          FOR a IN ANY SHORTEST_PATH article._id TO startVolume.start GRAPH 'nextToGraph'
          FILTER a.autoIndex
          RETURN a._key
        )

        RETURN {
          id: article._id,
          afterNote: article.afterNote,
          authorNote: article.authorNote,
          body: article.body,
          createdAt: article.createdAt,
          draft: article.draft,
          next: endVolume.end == ${id} ? null : next[0],
          num: LENGTH(num),
          parents: parents,
          previous: startVolume.start == ${id} ? null : previous[0],
          title: article.title,
          type: article.type,
          updatedAt: article.updatedAt,
          volNum: parents[0].num
        }
      `);
    })
    .then(r => {
      article = {
        chapters: { [id]: r._result[0] },
        ratings: { [id]: { down: 'none', up: 'none', thanks: 'none' } }
      };
      return getRatings(id, userId);
    }).then(r => { // does it exists? -> get authors
      if (r._result.length !== 0) r._result.forEach(d => article.ratings[id][d.type] = d.id);
      return getAuthors(id);
    }).then(r => { // get stats
      article.users = r.authors;
      article.chapters[id].authorIds = r.ids;
      article.chapters[id].positions = r.positions;
      return getStats([id], 'chapter', true);
    }).then(r => { // update view count
      article.stats = r.stats;
      article.statId = r.ids[0];
      article.chapters[id].statId = r.ids[0];
      return addView(id, r.ids[0], r.stats[r.ids[0]], vId, vType);
    }).then(() => { // mark updates
      article.stats[article.chapters[id].statId].views =
        article.stats[article.chapters[id].statId].views.complete.complete;
      return markUpdates(id, userId);
    }).then(() => { // get comments
      return getComments(null, null, id, 0, 'chapter');
    }).then(r => {
      if (r !== NO_COMMENTS) {
        article.comments = r.comments;
        article.chapters[id].commentIds = r.ids;
        article.chapters[id].replyIds = r.replyIds;
        article.replies = r.replies;
        article.ratings = { ...article.ratings, ...r.ratings };
        article.users = { ...article.users, ...r.authors };
      } else {
        article.chapters[id].commentIds = [];
        article.comments = {};
        article.replies = {};
      }
      article.id = id;
      article.type = 'comments';// for editor
      return res.status(200).json(article);
    }).catch(err => res.status(500).json(handleErrors('GET_ARTICLE_ERROR: ' + err)));
}


// POST ------------------------------------------------------------------------

export function postArticle(req, res){
  const userId = MAIN_USER;
  const title = convert(req.body.title, 'text');
  const parentId = convert(req.body.parentId, 'fictionId');
  const draft = convert(req.body.draft, 'bool');
  const autoIndex = convert(req.body.autoIndex, 'bool');
  const authors = convert(req.body.authors, 'authors');
  const authorNote = req.body.authorNote ? convert(req.body.authorNote, 'richText') : null;
  const body = convert(req.body.body, 'richText');
  const afterNote = req.body.afterNote ? convert(req.body.afterNote, 'richText') : null;
  const errors = validate([title, parentId, draft, autoIndex, authors, authorNote, body, afterNote]);
  const wordCount = getWordCount(body);
  let newId;
  let volumeId;
  
  return (wordCount < 10 ? Promise.reject(NOT_ENOUGH_WORD + '100)') : errors.length != 0 ?
    Promise.reject(errors) : canEdit(userId, parentId, ''))
    .then(r => {
      if (!r) return Promise.reject(CANNOT_EDIT);

      const article = {
        createdAt: convert(null, 'dateNow'),
        updatedAt: convert(null, 'dateNow'),
        title,
        draft,
        autoIndex,
        authorNote,
        body,
        afterNote,
        statType: `chapterCount`,
        type: 'chapter'
      };

      return db.query(aql`INSERT ${article} IN articles LET new = NEW RETURN new`);
    }).then(article => { // save authors
      newId = article._result[0]._id;
      let index = -1;
      authors.forEach((a, i) => a.id === userId ? index = i : '');
      index < 0 ? authors.push({ id: userId, positions: ['poster'] }) :
        authors[index].positions = [...authors[index].positions, 'poster'];
      
      return postAuthors(authors, newId, userId);
    })
    .then(() => db.query(aql`LET p = DOCUMENT (${parentId}) RETURN p.end`))
    .then(r => {volumeId = r._result[0]; return postParentTo(newId, volumeId);})
    .then(() => postNextTo(newId, volumeId)) // book
    .then(() => updateFirstAndLast(newId, volumeId, 'end')) // volume
    .then(() => postStat(newId, 'chapter', {}))
    .then(() => updateStatCount(newId, 'wordCount', wordCount, userId, null))
    .then(() => updateStatCount(parentId, autoIndex ? 'chapterCount' : 'articleCount', 1, userId, null))
    .then(() => updateStatCount(parentId, 'wordCount', wordCount))
    .then(() => updateStatCount(volumeId, autoIndex ? 'chapterCount' : 'articleCount', 1, userId, null))
    .then(() => updateStatCount(authors.map(a => a.id), 'chapterCount', 1, userId, null))
    .then(() => postUpdates(authors.map(a => a.id), newId, userId))
    .then(() => postUpdates([parentId], newId, userId))
    .then(() => getChapterLink(newId))
    .then(r => res.status(200).json(r))
    .catch(err => res.status(500).json(handleErrors('POST_ARTICLE_ERROR: ', err)));
}


// UPDATE ----------------------------------------------------------------------


// export function updateArticle(req, res) { }


// REMOVE ----------------------------------------------------------------------

// export function removeArticle(req, res) {}

export default {
  getArticle,
  postArticle
};