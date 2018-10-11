/** Important **/
/** You should not be committing this file to GitHub **/
/** Repeat: DO! NOT! COMMIT! THIS! FILE! TO! YOUR! REPO! **/
export const sessionSecret = process.env.SESSION_SECRET || 'Your Session Secret goes here';
export const google = {
  clientID: process.env.GOOGLE_CLIENTID || 'a',
  clientSecret: process.env.GOOGLE_SECRET || 'a',
  callbackURL: process.env.GOOGLE_CALLBACK || '/auth/google/callback'
};

/* To make sure everything referencing the session ID knows what it is called */
export const sessionId = 'sid';
