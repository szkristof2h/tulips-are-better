import { Database } from 'arangojs';
import { host, port, database, username, password } from './constants';

const db = new Database({
  url: `http://${host}:${port}`,
  databaseName: database,
  isAbsolute: true
});

db.useBasicAuth(username, password);

export default db;
