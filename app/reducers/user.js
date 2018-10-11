import { combineReducers } from 'redux';
import * as types from '../types';

const activeUser = (
  state = '',
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return '';
    case types.GET_LISTS_SUCCESS:
    case types.GET_LISTS_EXPAND_SUCCESS:
      return action.data.userId;
    case types.GET_USER_SUCCESS:
      return action.data.activeUser;
    case types.POST_FICTION_CONFIRM_DONATE_SUCCESS:
    case types.POST_FICTION_UP_REMOVE_SUCCESS:
      return state;
    default:
      return state;
  }
};

const currentUser = (
  state = { id: 'users/548986'},
  action
) => {
  switch (action.type) {
    case types.GET_FICTION_SUCCESS:
      return state;
    default:
      return state;
  }
};

const isLogin = (
  state = true,
  action
) => {
  switch (action.type) {
    case types.TOGGLE_LOGIN_MODE:
      return !state;
    default:
      return state;
  }
};

const message = (
  state = '',
  action
) => {
  switch (action.type) {
    case types.TOGGLE_LOGIN_MODE:
    case types.MANUAL_LOGIN_USER:
    case types.SIGNUP_USER:
    case types.LOGOUT_USER:
    case types.LOGIN_SUCCESS_USER:
    case types.SIGNUP_SUCCESS_USER:
      return '';
    case types.LOGIN_ERROR_USER:
    case types.SIGNUP_ERROR_USER:
      return action.message;
    default:
      return state;
  }
};

const isWaiting = (
  state = false,
  action
) => {
  switch (action.type) {
    case types.MANUAL_LOGIN_USER:
    case types.SIGNUP_USER:
    case types.LOGOUT_USER:
      return true;
    case types.LOGIN_SUCCESS_USER:
    case types.SIGNUP_SUCCESS_USER:
    case types.LOGOUT_SUCCESS_USER:
    case types.LOGIN_ERROR_USER:
    case types.SIGNUP_ERROR_USER:
    case types.LOGOUT_ERROR_USER:
      return false;
    default:
      return state;
  }
};

const authenticated = (
  state = false,
  action
) => {
  switch (action.type) {
    case types.LOGIN_SUCCESS_USER:
    case types.SIGNUP_SUCCESS_USER:
    case types.LOGOUT_ERROR_USER:
      return true;
    case types.LOGIN_ERROR_USER:
    case types.SIGNUP_ERROR_USER:
    case types.LOGOUT_SUCCESS_USER:
      return false;
    default:
      return state;
  }
};

const user = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.GET_USER_EXPAND_FRIENDS_SUCCESS:
      return { ...state, ['friendIds']: [...state.friendIds, ...action.data.ids] };
    case types.POST_FICTION_CONFIRM_DONATE_SUCCESS:
    case types.POST_FICTION_CONFIRM_LIST_SUCCESS:
    case types.POST_FICTION_CONFIRM_RATE_SUCCESS:
    case types.POST_FICTION_CONFIRM_SUBSCRIBED_SUCCESS:
    case types.POST_FICTION_DOWN_SUCCESS:
    case types.POST_FICTION_DOWN_REMOVE_SUCCESS:
    case types.POST_FICTION_FAVORITE_SUCCESS:
    case types.POST_FICTION_FAVORITE_REMOVE_SUCCESS:
    case types.POST_FICTION_FOLLOW_SUCCESS:
    case types.POST_FICTION_FOLLOW_REMOVE_SUCCESS:
    case types.POST_FICTION_UP_SUCCESS:
    case types.POST_FICTION_UP_REMOVE_SUCCESS:
      return state;
    case types.POST_USER_ADD_FRIEND_SUCCESS:
      return { ...state, ['connection']: { id: action.data.id, type: 'request' } };
    case types.POST_USER_REMOVE_FRIEND_SUCCESS:
      return { ...state, ['connection']: false };
    default:
      return state;
  }
};

const usersById = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return {};
    case types.GET_COMMENT_COMMENTS_SUCCESS:
    case types.GET_COMMENT_REPLIES_SUCCESS:
    case types.GET_CONVERSATION_MORE_MESSAGE_SUCCESS:
    case types.GET_FICTION_COMMENTS_SUCCESS:
    case types.GET_FICTION_REVIEWS_SUCCESS:
    case types.GET_FICTION_TYPOS_SUCCESS:
    case types.GET_REVIEW_REVIEWS_SUCCESS:
    case types.GET_TYPO_TYPOS_SUCCESS:
    case types.POST_COMMENT_SUCCESS:
    case types.POST_REVIEW_SUCCESS:
      return { ...state, ...action.data.users }
    case types.GET_AUTHOR_WORKS_SUCCESS:
    case types.GET_CHAPTER_SUCCESS:
    case types.GET_CONVERSATIONS_MORE_SUCCESS:
    case types.GET_CONVERSATION_SUCCESS:
    case types.GET_CONVERSATIONS_SUCCESS:
    case types.GET_DASHBOARD_SUCCESS:
    case types.GET_FICTION_SUCCESS:
    case types.GET_HOME_SUCCESS:
    case types.GET_LIST_SUCCESS:
    case types.GET_LISTS_SUCCESS:
    case types.GET_UNIVERSE_SUCCESS:
    case types.GET_USER_SUCCESS:
    case types.GET_WORKS_SUCCESS:
      return action.data.users;
    case types.GET_USER_EXPAND_FRIENDS_SUCCESS:
      return { ...{ ...state, [action.activeUser]: user(state[action.activeUser], action) }, ...action.data.friends };
    case types.POST_FICTION_CONFIRM_DONATE_SUCCESS:
    case types.POST_FICTION_CONFIRM_LIST_SUCCESS:
    case types.POST_FICTION_CONFIRM_RATE_SUCCESS:
    case types.POST_FICTION_CONFIRM_SUBSCRIBED_SUCCESS:
    case types.POST_FICTION_DOWN_SUCCESS:
    case types.POST_FICTION_DOWN_REMOVE_SUCCESS:
    case types.POST_FICTION_FAVORITE_SUCCESS:
    case types.POST_FICTION_FAVORITE_REMOVE_SUCCESS:
    case types.POST_FICTION_FOLLOW_SUCCESS:
    case types.POST_FICTION_FOLLOW_REMOVE_SUCCESS:
    case types.POST_FICTION_UP_SUCCESS:
    case types.POST_FICTION_UP_REMOVE_SUCCESS:;
      return state;
    case types.POST_USER_ADD_FRIEND_SUCCESS:
      return { ...state, [action.data.to]: user(state[action.data.to], action) };
    case types.POST_USER_REMOVE_FRIEND_SUCCESS:
      return { ...state, [action.data.user]: user(state[action.data.user], action) };
    default:
      return state;
  }
};

const status = (
  state = '',
  action
) =>
  action.type.includes('USER') ?
    action.type.includes('_REQUEST') ? `${action.type} is in process...` :
    action.type.includes('_FAILURE') ? `${(action.type).replace('_FAILURE', '')} has failed: ${action.error}` :
    action.type.includes('_SUCCESS') ? '' :
    state : state;
;

const isFetching = (state = '', action) => {
  switch (action.type) {
    case types.GET_USER_SUCCESS:
      return 'profile_loaded';
    case types.FETCHING:
      return 'unloaded';
    default:
      return state;
  }
};

const userReducer = combineReducers({
  activeUser,
  authenticated,
  currentUser,
  isFetching,
  isLogin,
  isWaiting,
  message,
  status,
  usersById
});

export default userReducer;
