import db from '../connect';
import { aql } from 'arangojs';

export default (id, done) => {
  return db.query(aql`
    FOR u IN users
    FILTER u._id == ${id}
    RETURN u
  `)
  .then(user => done(null, user))
  .catch(err => done(err, null));
};
