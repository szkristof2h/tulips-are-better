import { combineReducers } from 'redux';
import * as types from '../types';

const activeStat = (
  state = '',
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return '';
    case types.GET_CONVERSATIONS_SUCCESS:
    case types.GET_CHAPTER_SUCCESS:
    case types.GET_FICTION_SUCCESS:
      return action.data.statId;
    case 'SET_REPLY':
      return action.data.statId;
    default:
      return state;
  }
};

const showStats = (
  state = '',
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return '';
    case types.HIDE_STATS:
      return '';
    case types.SHOW_STATS:
      return action.data.id;
    case types.GET_DASHBOARD_SUCCESS:
      return ''
    default:
      return state;
  }
};

const statistic = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.POST_CONVERSATION_TRASH_SUCCESS:
    case types.POST_CONVERSATION_UNTRASH_SUCCESS:
      return { ...state, [action.data.type]: state[action.data.type] + action.data.value,
        inboxCount: state.inboxCount - action.data.value };
    case types.POST_CHAPTER_DOWN_SUCCESS:
    case types.POST_CHAPTER_DOWN_REMOVE_SUCCESS:
    case types.POST_CHAPTER_THANKS_SUCCESS:
    case types.POST_CHAPTER_THANKS_REMOVE_SUCCESS:
    case types.POST_CHAPTER_UP_SUCCESS:
    case types.POST_CHAPTER_UP_REMOVE_SUCCESS:
    case types.POST_CONVERSATION_STAR_SUCCESS:
    case types.POST_CONVERSATION_UNSTAR_SUCCESS:
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
      return { ...state, [action.data.type]: state[action.data.type] + action.data.value };// use statType instead
    case types.POST_COMMENT_SUCCESS:
    case types.POST_REVIEW_SUCCESS:
      return { ...state, [action.data.statType]: state[action.data.statType] + action.data.value };
    default:
      return state;
  }
};

const statisticsById = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return {};
    case types.GET_AUTHOR_WORKS_SUCCESS:
    case types.GET_CHAPTER_SUCCESS:
    case types.GET_DASHBOARD_SUCCESS:
    case types.GET_CONVERSATIONS_SUCCESS:
    case types.GET_FICTION_SUCCESS:
    case types.GET_HOME_SUCCESS:
    case types.GET_LIST_SUCCESS:
    case types.GET_UNIVERSE_SUCCESS:
    case types.GET_USER_SUCCESS:
    case types.GET_WORKS_SUCCESS:
      return action.data.stats;
    case types.GET_MORE_WORKS_SUCCESS:
      return { ...state, ...action.data.stats };
    case types.POST_CHAPTER_DOWN_SUCCESS:
    case types.POST_CHAPTER_DOWN_REMOVE_SUCCESS:
    case types.POST_CHAPTER_THANKS_SUCCESS:
    case types.POST_CHAPTER_THANKS_REMOVE_SUCCESS:
    case types.POST_CHAPTER_UP_SUCCESS:
    case types.POST_CHAPTER_UP_REMOVE_SUCCESS:
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
      return { ...state, [action.data.statId]: statistic(state[action.data.statId], action) };
    case types.POST_CONVERSATION_STAR_SUCCESS:
    case types.POST_CONVERSATION_UNSTAR_SUCCESS:
    case types.POST_CONVERSATION_TRASH_SUCCESS:
    case types.POST_CONVERSATION_UNTRASH_SUCCESS:
      return { ...state, [action.activeStat]: statistic(state[action.activeStat], action) };
    case types.POST_COMMENT_SUCCESS:
      return !origin ? state :
      { ...state, [action.activeStat]: statistic(state[action.activeStat], action) };
    case types.POST_REVIEW_SUCCESS:
      return { ...state, [action.activeStat]: statistic(state[action.activeStat], action), ...action.data.stats };
    default:
      return state;
  }
}

const info = (
  state = { activeTab: 'monthly' },
  action
) => {
  switch (action.type) {
    case types.DASHBOARD_STAT_CHOOSE_CONFIRM:
      return { ...state, ...{ [action.data.type]: action.data.id, ['activeTab']: action.data.tab } };
    case types.DASHBOARD_STAT_TAB:
      switch (action.data.tab) {
        case 'yearly':
          return {
            ...state, ...{ ['activeYear']: null, ['activeMonth']: null, ['activeWeek']: null, ['activeTab']: 'yearly' }
          };
        case 'monthly':
          return { ...state, ...{ ['activeMonth']: null, ['activeTab']: 'monthly' } };
        case 'weekly':
          return {
            ...state, ...{
              ['activeYear']: action.data.year, ['activeMonth']: null, ['activeWeek']: null,
              ['activeTab']: 'weekly'
            }
          };
        case 'daily':
          return {
            ...state, ...{
              ['activeYear']: action.data.year, ['activeMonth']: action.data.month, ['activeWeek']: null,
              ['activeTab']: 'daily'
            }
          };
        default:
          return state;
      }
    case types.FETCHING:
      return { activeTab: 'monthly' };
    default:
      return state;
  }
};

const status = (
  state = '',
  action
) => 
  action.type.includes('_REQUEST') ? `${action.type} is in process...` :
  action.type.includes('_FAILURE') ? `${(action.type).replace('_FAILURE', '')} has failed: ${action.error}` :
  action.type.includes('_SUCCESS') ? '' :
  state;
;

const statisticsReducer = combineReducers({
  activeStat,
  info,
  showStats,
  statisticsById,
  status
});

export default statisticsReducer;