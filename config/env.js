import { DB_TYPES } from './dbTypes';

export const ENV = process.env.NODE_ENV || 'development';

export const DB_TYPE = DB_TYPES.ARANGO;

export const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID || null;

