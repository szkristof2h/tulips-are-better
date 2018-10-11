import { combineReducers } from 'redux';
import * as types from '../types';

const listsById = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.GET_LISTS_SUCCESS:
      return action.data.lists;
    case types.GET_LISTS_EXPAND_SUCCESS:
      return { ...state, ...action.data.list };
    case types.GET_NOTIFICATIONS_SUCCESS:
      return action.data.notifications;
    case types.POST_LIST_DELETE_SUCCESS:
      let { [action.data.id]: deletedItem, ...rest } = state;
      return rest;
    default:
      return state;
  }
};

const listIds = (
  state = [],
  action
) => {
  switch (action.type) {
    case types.GET_LISTS_SUCCESS:
      return action.data.ids;
    case types.GET_LISTS_EXPAND_SUCCESS:
      return { ...state, ...action.data.ids };
    case types.GET_NOTIFICATIONS_SUCCESS:
      return action.data.ids;
    case types.POST_LIST_DELETE_SUCCESS:
      return state.filter(id => id !== action.data.id);
    default:
      return state;
  }
};

const status = (
  state = '',
  action
) => 
  action.type.includes('LISTS') || action.type.includes('NOTIFICATIONS') ? 
    action.type.includes('_REQUEST') ?  `${action.type} is in process...` :
    action.type.includes('_FAILURE') ? `${(action.type).replace('_FAILURE', '')} has failed: ${action.error}` :
    action.type.includes('_SUCCESS') ? '' :
    state : state;
;

const isFetching = (state = '', action) => {
  switch (action.type) {
    case types.GET_NOTIFICATIONS_SUCCESS:
      return 'notifications_loaded';
    case types.GET_LISTS_SUCCESS:
      return 'lists_loaded';
    case types.FETCHING:
      return 'unloaded';
    default:
      return state;
  }
};

const listReducer = combineReducers({
  isFetching,
  listIds,
  listsById,
  status
});

export default listReducer;