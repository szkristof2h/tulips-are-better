// Unused, no plan for local registration/login
import { comparePassword } from '../controllers/user';
import { aql } from 'arangojs';
import db from '../connect';

export default (email, candidatePassword, done) => {
  return db.query(aql`
    FOR u IN users
    FILTER u.email == ${email}
    RETURN u`
  ).then(user => {
    if (user._result.length === 0) return done(null, false, { message: `There is no record of the email ${email}.` });

    return comparePassword(user._result[0].password, candidatePassword, (passErr, isMatch) => {
      if (isMatch) {
        return done(null, user._result[0]);
      }

      return done(null, false, { message: 'Your email or password combination is not correct.' });
    });
  });
};
