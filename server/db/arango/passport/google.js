/* eslint-disable no-param-reassign */

import { aql } from 'arangojs';
import db from '../connect';

export default (req, accessToken, refreshToken, profile, db, done) => {
  if (req.user) {
    let user = db.query(aql`
      FOR u IN users
      FILTER u.google == ${profile.id}
      RETURN u`
    ).result.then(user => {
      if (user) {
        return done(null, false, { message: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
      }

      return user = db.query(aql`
        FOR u IN users
        FILTER u.id == ${req.user.id}
        RETURN u`
      ).result;
    }).then(user => {
      user.google = profile.id;
      user.tokens.push({ kind: 'google', accessToken });
      user.profile.name = user.profile.name || profile.displayName;
      user.profile.gender = user.profile.gender || profile._json.gender;
      user.profile.picture = user.profile.picture || profile._json.picture;

      return db.query(aql`
        FOR u IN users
        FILTER u.id == ${req.user.id}
        UPDATE u WITH ${user}`
      ).result;
    }).then(user => {
      return done(user, { message: 'Google account has been linked.' });
    }).catch(err => 'ERROR_GOOGLE_LINK');

    return user;
  }

  let user = db.query(aql`
    FOR u IN users
    FILTER u.google == ${profile.id}
    RETURN u`
  ).result.then(user => {
    if (user) return done(null, user);

    user = db.query(aql`
      FOR u IN users
      FILTER u.email == ${profile._json.emails[0].value}
      RETURN u`
    ).result.then(user => {
      if (user) {
        return done(null, false, { message: 'There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.' });
      }

      user = {};
      user.email = profile._json.emails[0].value;
      user.google = profile.id;
      user.tokens.push({ kind: 'google', accessToken });
      user.profile.name = profile.displayName;
      user.profile.gender = profile._json.gender;
      user.profile.picture = profile._json.picture;

      db.query(aql`
        INSERT ${user} INTO users`
      ).result.then(user => {
        done(user, { message: 'Google account has been linked.' });
      }).catch(err => 'ERROR_CONNECTING_GOOGLE');

    }).catch(err => 'ERROR_FINDING_USER_GOOGLE');
  }).catch(err => 'ERROR_GOOGLE_EXISTS');

  return user;
};
/* eslint-enable no-param-reassign */
