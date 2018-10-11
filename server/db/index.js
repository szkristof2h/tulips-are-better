const dbConfig = require('./arango').default;

export const connect = dbConfig.connect;
export const controllers = dbConfig.controllers;
export const passport = dbConfig.passport;
export const session = dbConfig.session;
export const init = dbConfig.init;

