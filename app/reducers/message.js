import * as types from '../types';

/*
 * Message store for global messages, i.e. Network messages / Redirect messages
 * that need to be communicated on the page itself. Ideally
 * messages/notifications should appear within the component to give the user
 * more context. - My 2 cents.
 */
export default function message(state = {
  status: '',
  text: '',
  type: ''
}, action = {}) {
  return action.type.includes('_FAILURE') ? {
    status: `${(action.type).replace('_FAILURE', '')} has failed`,
    text: action.error,
    type: 'error'
  } :
    action.type === 'DISMISS_MESSAGE' || action.type === types.FETCHING ?
      { status: '', text: '', type: ''} :
    state;
}
