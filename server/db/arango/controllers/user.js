import bcrypt from 'bcryptjs';
import db from '../connect';
import { CONNECTION_ALREADY_EXISTS, CONNECTION_NOT_FOUND, CANNOT_EDIT, DOCUMENT_NOT_FOUND, FOLLOWER_ONLY, MAIN_USER,
  NO_PERMISSION, PERMISSION_TO_EDIT_PERMISSIONS, PUBLIC_ID, USER_NOT_FOUND, NO_CHILDREN } from './constants';
import { aql } from 'arangojs';
import passport from 'passport';
import { convert, getRatings, handleErrors, toObject, getStats, updateStatCount, validate } from './misc';

// unused, to remove: site won't have local login only google, facebook, etc
export function comparePassword(password, candidatePassword, cb) {
  bcrypt.compare(candidatePassword, password, (err, isMatch) => {
    if (err) return cb(err);
    return cb(null, isMatch);
  });
}

export function login(req, res, next) {
  // Do email and password validation for the server
  passport.authenticate('local', (authErr, user, info) => {
    if (authErr) return next(authErr);
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    // Passport exposes a login() function on req (also aliased as
    // logIn()) that can be used to establish a login session
    return req.logIn(user, (loginErr) => {
      if (loginErr) return res.status(401).json({ message: loginErr });
      return res.status(200).json({
        message: 'You have been successfully logged in.'
      });
    });
  })(req, res, next);
}

export function logout(req, res) {
  // Do email and password validation for the server
  req.logout();
  res.redirect('/');
}

export function signUp(req, res, next) {
  const user = db.query(aql`
    FOR u IN users
    FILTER u.email == ${req.body.email}
    RETURN u
  `).then(user => {
    if(user._result.length !== 0) return res.status(409).json({ message: 'Account with this email address already exists!' });
   
    bcrypt.hash(req.body.password, 8, (err, hash) => {
      let u = {
        email: req.body.email,
        password: hash
      };

      db.query(aql`
        INSERT ${u} IN users
        RETURN NEW
      `).then(() => res.status(200).json({ message: 'You have been successfully registered.'}));
    });

  }).catch(err => console.log("Sign Up Error: " + err));
}

// GET -------------------------------------------------------------------------

export function hasPermission(uId, cId){
  const ids = Array.isArray(cId) ? cId : [cId];
  const userId = uId ? uId : PUBLIC_ID;

  return db.query(aql`
      FOR f IN ${ids}
        LET doc = DOCUMENT(f)

        LET isAuthor = (
          LET t = (
            FOR a, e IN INBOUND SHORTEST_PATH f TO ${userId} GRAPH 'authorsGraph'
              FILTER e.status != 'request'
              RETURN a
          )
          RETURN LENGTH(t) == 0 ? false : true
        )
        LET isRestricted = isAuthor ? false : (
          LET t = (
            FOR a, e IN INBOUND SHORTEST_PATH f TO ${userId} GRAPH 'permissionsGraph' RETURN e
          )
          RETURN t[1].type ? false : t[1].type
        )
        LET parents = doc.type != 'chapter' ? null : (
          FOR p IN 1..2 INBOUND f GRAPH 'parentsGraph'
            RETURN { id: p._id, title: p.title, fChapters: p.followerChapters, end: p.end, type: p.type }
        )
        LET active = (
          LET fiction = DOCUMENT(parents[1])

          RETURN fiction.status == 'active' ? true : false
        )
        LET parentId = parents == null || !parents[1].end ? '' : parents[1].end
        LET followerBlocked = doc.type != 'chapter' || parents == null || !parents[1].end || !active ? false : (
          Let follower = (FOR fT IN OUTBOUND SHORTEST_PATH ${userId} TO parentId GRAPH 'followsGraph' RETURN fT._id)
          LET chapters = LENGTH(follower) != 0 ? (FOR c IN 0..10 INBOUND parentId GRAPH 'nextToGraph' RETURN c._id) : null
          
          RETURN LENGTH(follower) != 0 ? false : POSITION(chapters, f, true) >= parents.fChapters ? false : true
        )
        
        LET hasPermission = isAuthor[0] ? f : isRestricted[0] == 'exclude' ? ${NO_PERMISSION} :
          followerBlocked ? ${FOLLOWER_ONLY} : f
        
        RETURN LENGTH(doc) == 0 ? ${DOCUMENT_NOT_FOUND} : hasPermission
    `)
    .then(r => r._result)
    .catch(err => handleErrors('HAS_PERMISSION_ERROR: ', err));
}

export function canEdit(userId, pId, pType) {
  const id = pId;
  const type = pType;
  
  return db.query(aql`
      LET t = (
        FOR a, e IN INBOUND SHORTEST_PATH ${id} TO ${userId} GRAPH 'authorsGraph'
          FILTER !(CONTAINS(e._to, 'fictions') || CONTAINS(e._to, 'articles')) || 
          (e.status != 'request' && CONTAINS(e.permission, 'edit'))
          RETURN true
      )
      RETURN LENGTH(t) != 0 ? true : false
    `)
    .then(r => r._result[0] ? true : false)
    .catch(err => handleErrors('CAN_EDIT_ERROR: ', err));
}

export function getAuthorsWorks(req, res) {
  const id = req.params.id ? convert(req.params.id, 'userId') : MAIN_USER;
  const userId = MAIN_USER;
  const draft = req.params.draft ? convert(req.params.draft, 'bool') : true;
  const offset = convert(req.params.offset, 'int');
  const getViews = req.url.split('/')[1] === 'getWorks' ? true : false;
  const errors = validate([id, draft, offset]);
  let fiction = { id };

  return (errors.length != 0 ? Promise.reject(errors) : db.query(aql`
      LET children = (
        FOR v, e IN 1 OUTBOUND ${id} GRAPH 'authorsGraph'
        FILTER POSITION(['universe', 'series', 'book'], v.type)
        SORT v.updatedAt DESC
        LIMIT ${offset}, 20
        RETURN { id: v._id, authorIds: [${id}], categories: v.categories, date: v.createdAt, status: v.status, 
          summary: v.body, tags: v.tags, thumbnail: v.thumbnail, title: v.title, type: v.type }
      )
      LET user = (
        LET u = DOCUMENT(${id})
        RETURN { id: u._id, link: u.link, avatar: u.avatar, name: u.displayName }
      )
      LET stats = (
        FOR s IN 1 INBOUND ${id} GRAPH 'statsGraph'
        RETURN { id: s._id, follow: s.follow }
      )
      LET ratings = (
        FOR rT IN ratingTo
          FILTER rT._from == ${userId} && rT._to == ${id}
          RETURN { id: rT._key, type: rT.type }
      )
      RETURN { children, ids: children[*].id, user, stats, ratings }
    `))
    .then(r => {
      if (r._result[0].user[0].id === null) return Promise.reject(DOCUMENT_NOT_FOUND);
      if (offset != 0 && r._result[0].ids.length == 0) return Promise.reject(NO_CHILDREN);
      
      fiction.users = { [id]: r._result[0].user[0] };
      fiction.users[id].statId = r._result[0].stats[0].id;
      fiction.ratings = { [id]: { follow: r._result[0].ratings[0] ? r._result[0].ratings[0].id : 'none' } };
      fiction.stats = { [r._result[0].stats[0].id]: r._result[0].stats[0] };
      fiction.users[id].authorIds = [id];

      if (r._result[0].children.length != 0){
        fiction.children = toObject(r._result[0].children, 'id');
        fiction.users[id].childrenIds = r._result[0].ids;
        return getStats(fiction.users[id].childrenIds, 'fiction', getViews);
      }
      fiction.children = {};
      return 'skip';
    }).then(r => {
      if(r !== 'skip'){
        fiction.stats = { ...fiction.stats, ...r.stats };
        r.ids.forEach((s, i) => fiction.children[r.to[i]].statId = s);
      }

      return res.status(200).json(fiction);
    }).catch(err => res.status(500).json(handleErrors('GET_AUTHORS_WORKS_ERROR: ', err)));
}

export function getProfile(req, res) {
  const id = req.params.id ? convert(req.params.id, 'userId') : MAIN_USER;// if no params, it'll be users own profile
  const userId = MAIN_USER;
  const fields = ['avatar', 'displayName', 'gender', 'location', 'fullName', 'email', 'createdAt', 'birthDate', 'bio',
    'website'];
  let user = { users: { [id]: { friendIds: [] } }, stats: {}, activeUser: '' };
  const errors = validate([id]);
  
  return (errors.length != 0 ? Promise.reject(errors) : db.query(aql`
      LET user = DOCUMENT(${id})
      LET connected = ${userId} == ${PUBLIC_ID} || ${id} == ${userId} || LENGTH(user) == 0 ? false : (
        LET connection = (
          FOR v, e IN ANY SHORTEST_PATH ${id} TO ${userId} GRAPH 'connectionsGraph'
            RETURN { id: e._id, type: e.type }
        )

        RETURN LENGTH(connection) == 0 ? false : connection[1]
      )

      LET level = ${id} == ${userId} ? 'own' : connected[0].type == 'friends' ? 'friends' : ${userId} != ${PUBLIC_ID} ?
        'registered' : 'public'
      LET privacy = LENGTH(user) == 0 ? [] : user.settings.privacy[level]
      LET profile = LENGTH(user) == 0 ? null : (
        FOR f IN privacy
        FILTER POSITION(${fields}, f)
        RETURN f
      )

      RETURN LENGTH(user) == 0 ? ${USER_NOT_FOUND} : MERGE(KEEP(user, profile), { level: level },
        { fields: privacy }, { connection: connected[0] })
    `))
    .then(r => {
      if (r._result[0] === USER_NOT_FOUND) return USER_NOT_FOUND;

      user.users[id] = { ...user.users[id], ...r._result[0]};

      if (!user.users[id].fields.includes('friends')) return 'skip';

      return getFriends(null, null, id, userId);
    })
    .then(r => {
      if (r === USER_NOT_FOUND) return USER_NOT_FOUND;
      if (r !== 'skip' && r.ids.length != 0) {
        user.users = { ...user.users, ... r.friends };
        user.users[id].friendIds = r.ids;
      }

      return getStats([id], 'user', false);
    }).then(r => {
      if (r !== USER_NOT_FOUND) {
        user.stats = r.stats;
        user.users[id].statId = r.ids[0];
        user.activeUser = id;
        delete user.users[id].fields;
      }
      res.status(200).json(user);
    }).catch(err => res.status(500).json(handleErrors('GET_USER_ERROR: ', err)));
}

export function getFriends(req, res, tId, uId){
  const id = req ? convert(req.params.id, 'userId') : tId;
  const userId = MAIN_USER;
  const offset = req ? convert(req.params.offset, 'offset') : 0;
  const limit = 1;
  const pending = req ? false : false;// show pending connection, will include later
  const errors = validate([id, offset]);

  return (errors.length != 0 ? Promise.reject(errors) : db.query(aql`
      LET user = DOCUMENT(${id})
      LET connected = ${userId} == ${PUBLIC_ID} || ${id} == ${userId} || LENGTH(user) == 0 ? false : (
        LET connection = (
          FOR v, e IN ANY SHORTEST_PATH ${id} TO ${userId} GRAPH 'connectionsGraph'
            FILTER e.type != 'request'
            RETURN v._id
        )

        RETURN LENGTH(connection) == 0 ? false : true
      )

      LET level = ${id} == ${userId} ? 'own' : connected[0] ? 'friends' : ${userId} != ${PUBLIC_ID} ? 'registered'
        : 'public'

      LET hasAccess = LENGTH(user) == 0 ? false : POSITION(user.settings.privacy[level], 'friends', false)

      LET friends = !hasAccess ? 'NO_PERMISSION_FRIENDS' : (
        FOR v, e IN 1 ANY ${id} GRAPH 'connectionsGraph'
        FILTER ${pending} ? true : e.type != 'request'
        SORT v.displayName ASC
        LIMIT ${offset}, ${limit}
          RETURN { id: v._id, avatar: v.avatar, name: v.displayName, title: v.title }
      )

      RETURN { friends: friends, ids: friends[*].id }
    `))
    .then(r => {
      let friends = { friends: {}, ids: [] };
      if (r._result[0].friends.length != 0) friends = { friends: toObject(r._result[0].friends, 'id'),
        ids: r._result[0].ids };
      return res ? res.status(200).json(friends) : friends;
    })
    .catch(err => res !== null ? res.status(500).json(handleErrors('GET_FRIENDS_ERROR: ', err)) :
      handleErrors('GET_FRIENDS_ERROR: ', err));
}

// export function getMyFollows(req, res) {}

export function getUserName(req, res) {
  const id = convert(req.body.id, 'userId');
  const positions = convert(req.body.positions, 'positions');
  const errors = validate([id, positions]);

  return (errors.length != 0 ? Promise.reject(errors) : db.query(aql`
    LET user = DOCUMENT(${id})
    RETURN { id: user._id, name: user.displayName, positions: ${positions} }`))
  .then(r => r._result[0] === USER_NOT_FOUND ? Promise.reject(USER_NOT_FOUND) : res.status(200).json(r._result[0]))
  .catch (err => res.status(500).json(handleErrors('GET_USER_NAME_ERROR: ', err)));
}


// POST ------------------------------------------------------------------------

export function postAddFriend(req, res){
  const userId = MAIN_USER;
  const id = convert(req.body.id, 'userId');
  const errors = validate([id]);

  return (errors.length != 0 ? Promise.reject(errors) : db.query(aql`LET u = DOCUMENT(${id}) RETURN u`))
    .then(r => r._result.length == 0 ? Promise.reject(USER_NOT_FOUND) :
      db.query(aql`FOR f IN ANY SHORTEST_PATH ${id} TO ${userId} GRAPH 'connectionsGraph' RETURN true`)) 
    .then(r => r._result.length != 0 ? Promise.reject(CONNECTION_ALREADY_EXISTS) :
      db.query(aql`INSERT { _from: ${userId}, _to: ${id}, createdAt: DATE_NOW(), type: 'request' }
      IN connectedTo RETURN NEW._id`))  
    .then(r => r._result.length != 0 ? res.status(200).json({ id: r._result[0], from: userId, to: id }) :
      Promise.reject('The friend request wasn\'t successful!'))
    .catch(err => res.status(500).json(('POST_ADD_FRIEND_ERROR: ', err)));
}

export function postConfirmFriend(req, res) {
  const userId = MAIN_USER;
  const id = convert(req.body.id, 'connectedToId');
  const fId = convert(req.body.fId, 'userId');
  const errors = validate([id, fId]);

  return (errors.length == 0 ? db.query(aql`LET e = DOCUMENT(${id}) RETURN { from: e._from id: e._id, to: e._to }`) :
    Promise.reject(errors))
    .then(r => r._result.length === 0 ? Promise.reject(USER_NOT_FOUND) : r._result[0].to === userId ?
      db.query(aql`UPDATE { _key: ${r._result[0].id.replace('connectedTo/', '')} WITH { type: 'friend' } IN connectedTo
      RETURN '' }`) : Promise.reject(NO_PERMISSION))
    .then(() => updateStatCount(userId, 'friendCount', 1, userId, null))
    .then(() => updateStatCount(fId, 'friendCount', 1, userId, null))
    .then(() => res.status(200).json(true))
    .catch(err => res.status(500).json(handleErrors('POST_CONFIRM_FRIEND_ERROR:', err)));
}

export function postPermissions(permissions, pType, parentId, userId) {}

// todo: rework it for other type of updates not just, fiction & article
export function postUpdates(ids, pId, uId){
  const parentId = pId ? pId : 'fictions/1';// <- is just a dummy fiction with the only purpose of edge connection
  const userId = uId;

  return db.query(aql`
      FOR a IN ${ids}
        FOR u IN 1 INBOUND a GRAPH 'followsGraph'
        INSERT {
          _from: ${parentId},
          _to: u._id,
          by: ${userId},
          createdAt: DATE_NOW(),
          seen: false,
          type: CONTAINS(a.id, 'users/') ? 'author' : CONTAINS(a.id, 'fictions/') ? 'fiction' : 'chapter'
        } IN updateOf RETURN true
    `)
    .then(() => '')
    .catch(err => handleErrors('POST_UPDATE_ERROR: ',  err));
}

export function markUpdates(pId, uId) {
  const id = pId;
  const userId = uId;

  return db.query(aql`
    LET notification = (FOR a, e IN INBOUND SHORTEST_PATH ${id} TO ${userId} GRAPH 'updatesGraph' RETURN e._id)
    RETURN LENGTH(notification) == 0 ? false : notification[1]`)
  .then(r => !r._result[0] ? '' : db.query(aql`
      LET notification = DOCUMENT(${r._result[0]})
      UPDATE notification WITH { seen: true } IN updateOf
      RETURN ''`))
  .then(() => true)
  .catch(err => handleErrors('MARK_UPDATES_ERROR: ' + err));
}


// UPDATE ----------------------------------------------------------------------


// export function updateProfile(req, res) {}



// REMOVE ----------------------------------------------------------------------


export function removeFriend(req, res){
  const userId = MAIN_USER;
  const id = convert(req.body.cId, 'connectedTo');
  const ratings = { id: id };
  const errors = validate([id, fId]);

  return (errors.length != 0 ? Promise.reject(errors) : db.query(aql`
      FOR cT IN connectedTo
      FILTER cT._id == ${id} && (cT._from == ${userId} || cT._to == ${userId})
      REMOVE cT IN connectedTo
      RETURN { id: cT._from == ${userId} ? cT._to : cT._from, type: cT.type }
    `))
    .then(r => {
      if (r._result.length == 0) return Promise.reject(CONNECTION_NOT_FOUND);
      ratings.type = r._result[0].type;
      ratings.user = r._result[0].id;
      const ids = [userId, ratings.user];

      if (r._result[0].type === 'request') return '';

      return db.query(aql`
        FOR sT IN statTo
          FILTER POSITION(${ids}, sT._to, false)
          LET s = DOCUMENT(sT._from)
          UPDATE s WITH { friendsCount: s.friendsCount - 1 } IN statistics
      `);
    })
    .then(() => res.status(200).json(ratings))
    .catch(err => res.status(200).json(handleErrors('REMOVE_FRIEND_ERROR: ', err)));
}

// export function removePermission(req, res) {}


export default {
  comparePassword,
  login,
  logout,
  signUp,
  getAuthorsWorks,
  getFriends,
  getProfile,
  getUserName,
  markUpdates,
  postAddFriend,
  postConfirmFriend,
  removeFriend,
  hasPermission,
  postPermissions,
  canEdit,
  postUpdates
};