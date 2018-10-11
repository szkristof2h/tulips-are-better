import { combineReducers } from 'redux';
import * as types from '../types';

const comment = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.POST_COMMENT_DOWN_SUCCESS:
    case types.POST_COMMENT_UP_SUCCESS:
    case types.POST_COMMENT_UP_REMOVE_SUCCESS:
    case types.POST_COMMENT_DOWN_REMOVE_SUCCESS:
      return { ...state, [action.data.type]: state[action.data.type] + action.data.value };
    case types.POST_COMMENT_EDIT_SUCCESS:
      return { ...state, text: action.data.text };
    case types.POST_COMMENT_SUCCESS:
      return { ...state, replyCount: state.replyCount + 1 };
    case types.POST_CONFIRM_RATE_SUCCESS:
      return { ...state, score: action.data.score };
    case types.POST_REVIEW_EDIT_SUCCESS:
      return { ...state, text: action.data.text ? action.data.text : state.text, score: action.data.score };
    default:
      return state;
  }
};

const commentsById = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return {};
    case types.GET_COMMENT_COMMENTS_SUCCESS:
    case types.GET_CONVERSATION_MORE_MESSAGE_SUCCESS:
    case types.GET_REVIEW_REVIEWS_SUCCESS:
    case types.GET_TYPO_TYPOS_SUCCESS:
    case types.POST_COMMENT_SUCCESS:
    case types.POST_REVIEW_SUCCESS:
      return !action.data.origin ? { ...state, ...action.data.comments } :
      { ...{ ...state, [action.data.origin]: comment(state[action.data.origin], action) }, ...action.data.comments };
    case types.GET_CHAPTER_SUCCESS:
    case types.GET_CONVERSATION_SUCCESS:
    case types.GET_DASHBOARD_SUCCESS:
    case types.GET_FICTION_CHAPTER_SUCCESS:
    case types.GET_FICTION_SUCCESS:
    case types.GET_FICTION_COMMENTS_SUCCESS:
    case types.GET_FICTION_REVIEWS_SUCCESS:
    case types.GET_FICTION_TYPOS_SUCCESS:
      return action.data.comments;
    case types.GET_COMMENT_REPLIES_SUCCESS:
      return { ...state, ...action.data.comments };
    case types.POST_COMMENT_DOWN_SUCCESS:
    case types.POST_COMMENT_UP_SUCCESS:
    case types.POST_COMMENT_UP_REMOVE_SUCCESS:
    case types.POST_COMMENT_DOWN_REMOVE_SUCCESS:
      return { ...state, [action.data.id]: comment(state[action.data.id], action) };
    case types.POST_COMMENT_EDIT_SUCCESS:
    case types.POST_REVIEW_EDIT_SUCCESS:
    case types.POST_CONFIRM_RATE_SUCCESS:
      return { ...state, [action.data.id]: comment(state[action.data.id], action) };
    default:
      return state;
  }
};

const conversationIds = (
  state = [],
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return [];
    case types.GET_CONVERSATION_SUCCESS:
      return action.data.id;
    case types.GET_CONVERSATIONS_SUCCESS:
      return action.data.ids;
    case types.POST_CONVERSATION_DELETE_SUCCESS:
    case types.POST_CONVERSATION_TRASH_SUCCESS:
    case types.POST_CONVERSATION_UNTRASH_SUCCESS:
      return state.filter(c => c !== action.data.id);
    default:
      return state;
  }
};

const conversation = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.GET_CONVERSATION_MORE_MESSAGE_SUCCESS:
      return { ...state, ids: [...state.ids, ...action.data.conversations[action.data.id[0]].ids] }
    case types.POST_CONVERSATION_STAR_SUCCESS:
      return { ...state, ['starred']: true }
    case types.POST_CONVERSATION_UNSTAR_SUCCESS:
      return { ...state, ['starred']: false }
    default:
      return state;
  }
};

const conversationsById = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return {};
    case types.GET_CONVERSATIONS_MORE_SUCCESS:
      return { ...state, ...action.data.conversations };
    case types.GET_CONVERSATION_SUCCESS:
    case types.GET_CONVERSATIONS_SUCCESS:
      return action.data.conversations;
    case types.POST_CONVERSATION_DELETE_SUCCESS:
    case types.GET_CONVERSATION_MORE_MESSAGE_SUCCESS:
      return action.data.id ? { ...state, [action.data.id[0]]: conversation(state[action.data.id[0]], action) }
        : state;
    case types.POST_CONVERSATION_TRASH_SUCCESS:
    case types.POST_CONVERSATION_UNTRASH_SUCCESS:
      let { [action.data.id]: deletedItem, ...rest } = state;
      return rest;
    case types.POST_CONVERSATION_STAR_SUCCESS:
    case types.POST_CONVERSATION_UNSTAR_SUCCESS:
      return { ...state, [action.data.id]: conversation(state[action.data.id], action) };
    default:
    return state;
  }
};

const filter = (
  state = '',
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return '';
    case types.GET_CONVERSATIONS_SUCCESS:
      return action.data.filter;
    default:
      return state;
  }
};

const replies = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return {};
    case types.GET_COMMENT_COMMENTS_SUCCESS:
    case types.GET_REVIEW_REVIEWS_SUCCESS:
    case types.GET_TYPO_TYPOS_SUCCESS:
      return { ...state, ...action.data.replies };
    case types.GET_CHAPTER_SUCCESS:
    case types.GET_FICTION_COMMENTS_SUCCESS:
    case types.GET_FICTION_REVIEWS_SUCCESS:
    case types.GET_FICTION_TYPOS_SUCCESS:
    case types.GET_FICTION_SUCCESS:
    return action.data.replies || {};
    case types.GET_COMMENT_LIST_SUCCESS:
      return { ...state, ...action.data.comments };
    case types.GET_COMMENT_REPLIES_SUCCESS:
      return { ...state, [action.data.origin]: [...state[action.data.origin],
        ...action.data.replies[action.data.origin]] };
    case types.POST_COMMENT_SUCCESS:
      return action.data.origin ? { ...state, [action.data.origin]: [...state[action.data.origin] ? state[action.data.origin] : {}, action.data.id] } :
        state;
    default:
      return state;
  }
};

const status = (
  state = '',
  action
) =>
  action.type.includes('COMMENT') ?
    action.type.includes('_REQUEST') ? `${action.type} is in process...` :
    action.type.includes('_FAILURE') ? `${(action.type).replace('_FAILURE', '')} has failed: ${action.error}` :
    action.type.includes('_SUCCESS') ? '' :
    state : state;
;

const isFetching = (state = '', action) => {
  switch (action.type) {
    case types.GET_CONVERSATION_SUCCESS:
      return 'conversation_loaded';
    case types.GET_CONVERSATIONS_SUCCESS:
      return 'conversations_loaded';
    case types.FETCHING:
      return 'unloaded';
    default:
      return state;
  }
};

const tab = (state = '', action) => {
  switch (action.type) {
    case types.FETCHING:
      return '';
    case types.GET_CHAPTER_SUCCESS:
      return 'chapter';
    case types.GET_FICTION_SUCCESS:
      return 'fiction';
    case types.GET_CONVERSATION_SUCCESS:
      return 'conversation';
    case types.GET_DASHBOARD_SUCCESS:
      return 'dashboard';
    default:
      return state;
  }
};

const commentReducer = combineReducers({
  commentsById,
  conversationIds,
  conversationsById,
  filter,
  isFetching,
  replies,
  status,
  tab
});

export default commentReducer;