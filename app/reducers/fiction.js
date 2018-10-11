import { combineReducers } from 'redux';
import * as types from '../types';


const activeFiction = (
  state = '',
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return '';
    case types.GET_AUTHOR_WORKS_SUCCESS:
    case types.GET_CHAPTER_SUCCESS:
    case types.GET_DASHBOARD_SUCCESS:
    case types.GET_FICTION_SUCCESS:
    case types.GET_LIST_SUCCESS:
    case types.GET_MORE_WORKS_SUCCESS:
    case types.GET_UNIVERSE_SUCCESS:
    case types.GET_WORKS_SUCCESS:
      return action.data.id;
    case types.GET_HOME_SUCCESS:
      return action.data.fictionIds[0];
    default:
      return state;
  }
};

const chapterIds = (
  state = [],
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return [];
    case types.GET_HOME_SUCCESS:
      return action.data.chapterIds;
    default:
      return state;
  }
}

const chapter = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.GET_COMMENT_COMMENTS_SUCCESS:
    case types.GET_REVIEW_REVIEWS_SUCCESS:
    case types.GET_TYPO_TYPOS_SUCCESS:
      return { ...state, ['commentIds']: [...state.commentIds, ...action.data.ids] };
    case types.GET_FICTION_COMMENTS_SUCCESS:// switch to
    case types.GET_FICTION_REVIEWS_SUCCESS:// switch to
    case types.GET_FICTION_TYPOS_SUCCESS:
      return { ...state, ['commentIds']: action.data.ids };
    case types.POST_COMMENT_SUCCESS:
      return !action.data.replyTo ? { ...state, commentIds: [...action.data.ids, ...state.commentIds] } : state;
  }
}

const chaptersById = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return {};
    case types.GET_CHAPTER_SUCCESS:
    case types.GET_FICTION_SUCCESS:
      return action.data.chapters;
    case types.GET_COMMENT_COMMENTS_SUCCESS:
    case types.GET_FICTION_COMMENTS_SUCCESS:
    case types.GET_FICTION_REVIEWS_SUCCESS:
    case types.GET_FICTION_TYPOS_SUCCESS:
    case types.GET_REVIEW_REVIEWS_SUCCESS:
    case types.GET_TYPO_TYPOS_SUCCESS:
    case types.POST_COMMENT_SUCCESS:
      return action.activeFiction.includes('articles') ?
        { ...state, [action.activeFiction]: chapter(state[action.activeFiction], action) } : state;
    case types.GET_DASHBOARD_SUCCESS:
      return action.data.chapters ? action.data.chapters : {};
    case types.GET_FICTION_VOLUME_SUCCESS:
      return action.data.children;
    case types.GET_HOME_SUCCESS:
      return action.data.chapters;
    default:
      return state;
  }
}

const child = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.GET_FICTION_VOLUME_SUCCESS:
      return { ...state, ['chapterIds']: action.data.ids }
  }
}

const childrenById = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return {};
    case types.GET_AUTHOR_WORKS_SUCCESS:
    case types.GET_DASHBOARD_SUCCESS:
    case types.GET_FICTION_SUCCESS:
    case types.GET_LIST_SUCCESS:
    case types.GET_UNIVERSE_SUCCESS:
    case types.GET_WORKS_SUCCESS:
      return action.data.children;
    case types.GET_FICTION_VOLUME_SUCCESS:
      return { ...state, [action.data.parentId]: child(state[action.data.parentId], action) }
    case types.GET_FICTION_VOLUMES_SUCCESS:
      return { ...state, ...action.data.children }
    case types.GET_MORE_WORKS_SUCCESS:
      return { ...state, ...action.data.children };
    case types.POST_LIST_DELETE_ITEM_SUCCESS:
      let { [action.data.deleted]: deletedItem, ...rest } = state;
      return rest;
    default:
      return state;
  }
}

const expanded = (
  state = [],
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return [];
    case types.FICTION_EXPAND:
    case types.LIST_ITEM_EXPAND:
      return state.includes(action.data.id) ? state : [...state, action.data.id];
    default:
      return state;
  }
}

const featuredIds = (
  state = [],
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return [];
    case types.GET_HOME_SUCCESS:
      return action.data.featuredIds;
    default:
      return state;
  }
}

const fiction = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.POST_COMMENT_SUCCESS:
      return !action.data.replyTo ? { ...state, commentIds: [...state.commentIds, ...action.data.ids] } : state;
    case types.GET_FICTION_COMMENTS_SUCCESS:// switch to
    case types.GET_FICTION_REVIEWS_SUCCESS:// switch to
    case types.GET_FICTION_TYPOS_SUCCESS:
      return { ...state, ['commentIds']: action.data.ids };
      case types.GET_FICTION_VOLUME_SUCCESS:
      return { ...state, ['selectedChild']: action.data.parentId }
      case types.GET_FICTION_VOLUMES_SUCCESS:
      return { ...state, ['childrenIds']: [...state.childrenIds, ...action.data.ids.filter(id => !state.childrenIds.includes(id))] };
    case types.GET_FICTION_CHAPTER_SUCCESS:
      return state;
    case types.GET_COMMENT_COMMENTS_SUCCESS:
    case types.GET_REVIEW_REVIEWS_SUCCESS:
    case types.GET_TYPO_TYPOS_SUCCESS:
    case types.POST_REVIEW_SUCCESS:
      return { ...state, ['commentIds']: [...action.data.ids, ...state.commentIds] };
    default:
      return state;
  }
};

const fictionIds = (
  state = [],
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return [];
    case types.GET_HOME_SUCCESS:
      return action.data.fictionIds;
    default:
      return state;
  }
}

const fictionsById = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return {};
    case types.GET_AUTHOR_WORKS_SUCCESS:
    case types.GET_WORKS_SUCCESS:
      return action.data.users;
    case types.GET_COMMENT_COMMENTS_SUCCESS:
    case types.GET_REVIEW_REVIEWS_SUCCESS:
    case types.GET_FICTION_COMMENTS_SUCCESS:
    case types.GET_FICTION_REVIEWS_SUCCESS:
    case types.GET_FICTION_TYPOS_SUCCESS:
    case types.GET_TYPO_TYPOS_SUCCESS:
    case types.POST_COMMENT_SUCCESS:
    case types.POST_REVIEW_SUCCESS:
      return action.activeFiction.includes('fictions/') ? { 
        ...state, [action.activeFiction]: fiction(state[action.activeFiction], action)
      } : state;
    case types.GET_FICTION_VOLUME_SUCCESS:
      return { ...state, [action.activeFiction]: fiction(state[action.activeFiction], action) };
    case types.GET_FICTION_VOLUMES_SUCCESS:
      return { ...state, [action.activeFiction]: fiction(state[action.activeFiction], action) };
      case types.GET_LIST_SUCCESS:
      return action.data.list;
    case types.GET_DASHBOARD_SUCCESS:
    case types.GET_FICTION_SUCCESS:
    case types.GET_UNIVERSE_SUCCESS:
      return action.data.fiction;
    case types.GET_FICTION_CHAPTER:
      return { ...state, ...action.data.fiction };
    case types.GET_FICTION_REVIEWS_SUCCESS:
      return { ...state, ...action.data.fiction };
    case types.GET_FICTION_LIST_SUCCESS:
    case types.GET_FICTION_LIST_SORTED_SUCCESS:
      return { ...state, ...action.data.fictions };
    case types.GET_HOME_SUCCESS:
      return action.data.fictions;
    case types.POST_LIST_DELETE_ITEM_SUCCESS:
      return { ...state, [action.data.id]: fiction(state[action.data.id], action) };
    default:
      return state;
  }
};

const ownReview = (state = {}, action) => {
  switch (action.type) {
    case types.FETCHING:
      return {};
    case types.POST_REVIEW_EDIT_SUCCESS:
    case types.POST_REVIEW_SUCCESS:
      return { id: action.data.id, score: action.data.comments[action.data.id].score };
    case types.GET_FICTION_SUCCESS:
      return action.data.ownReview;
    default:
      return state;
  }
};

const selecting = (
  state = false,
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return false;
    case types.GET_FICTION_VOLUMES_SUCCESS:
      return true;
    case types.FICTION_CLOSE_VOLUMES:
    case types.GET_DASHBOARD_SUCCESS:
    case types.GET_FICTION_SUCCESS:
    case types.GET_FICTION_VOLUME_SUCCESS:
    case types.GET_HOME_SUCCESS:
    case types.GET_LIST_SUCCESS:
    case types.GET_UNIVERSE_SUCCESS:
      return false;
    default:
      return state;
  }
}

const sortBy = (
  state = '',
  action
) => {
  switch (action.type) {
    case types.GET_FICTION_LIST_SORTED_SUCCESS:
      return action.data.sortBy;
    default:
      return state;
  }
};

const status = (
  state = '',
  action
) => 
  action.type.includes('FICTION') || action.type.includes('DASHBOARD') || action.type.includes('LIST')  ? 
    action.type.includes('_REQUEST') ?  `${action.type} is in process...` :
    action.type.includes('_FAILURE') ? `${(action.type).replace('_FAILURE', '')} has failed: ${action.error}` :
    action.type.includes('_SUCCESS') ? '' :
    state : state;
;

const isFetching = (state = '', action) => {
  switch (action.type) {
    case types.GET_AUTHOR_WORKS_SUCCESS:
    case types.GET_LIST_SUCCESS:
    case types.GET_UNIVERSE_SUCCESS:
      return 'list_loaded';
    case types.GET_CHAPTER_SUCCESS:
      return 'chapter_loaded';
    case types.GET_DASHBOARD_SUCCESS:
      return 'dashboard_loaded';
    case types.GET_FICTION_SUCCESS:
      return 'fiction_loaded';
    case types.GET_HOME_SUCCESS:
      return 'home_loaded';
    case types.GET_WORKS_SUCCESS:
      return 'works_loaded';
    case types.FETCHING:
      return 'unloaded';
    default:
      return state;
  }
};

const fictionReducer = combineReducers({
  activeFiction,
  chapterIds,
  chaptersById,
  childrenById,
  expanded,
  featuredIds,
  fictionIds,
  fictionsById,
  isFetching,
  ownReview,
  selecting,
  sortBy,
  status
});

export default fictionReducer;