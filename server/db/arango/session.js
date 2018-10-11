// Using redis as session store
import session from 'express-session';
import RedisStore from 'connect-redis';
const store = new RedisStore(session);

export default () =>
  new store({
    host: "",
    port: "",
    pass: "",
    ttl: 60 * 60 * 24 * 14
  });