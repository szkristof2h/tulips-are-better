import { combineReducers } from 'redux';
import * as types from '../types';


const rating = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.POST_CHAPTER_DOWN_SUCCESS:
    case types.POST_CHAPTER_THANKS_SUCCESS:
    case types.POST_CHAPTER_UP_SUCCESS:
    case types.POST_COMMENT_DOWN_SUCCESS:
    case types.POST_COMMENT_UP_SUCCESS:
    case types.POST_FICTION_CONFIRM_DONATE_SUCCESS:
    case types.POST_FICTION_CONFIRM_LIST_SUCCESS:
    case types.POST_FICTION_CONFIRM_RATE_SUCCESS:
    case types.POST_FICTION_CONFIRM_SUBSCRIBED_SUCCESS:
    case types.POST_FICTION_DOWN_SUCCESS:
    case types.POST_FICTION_FAVORITE_SUCCESS:
    case types.POST_FICTION_FOLLOW_SUCCESS:
    case types.POST_FICTION_UP_SUCCESS:
      return { ...state, [action.data.type]: action.data.ratingId.replace('ratingTo/', '') };// change to send key?
    case types.POST_CHAPTER_DOWN_REMOVE_SUCCESS:
    case types.POST_CHAPTER_THANKS_REMOVE_SUCCESS:
    case types.POST_CHAPTER_UP_REMOVE_SUCCESS:
    case types.POST_COMMENT_DOWN_REMOVE_SUCCESS:
    case types.POST_COMMENT_UP_REMOVE_SUCCESS:
    case types.POST_FICTION_DOWN_REMOVE_SUCCESS:
    case types.POST_FICTION_FAVORITE_REMOVE_SUCCESS:
    case types.POST_FICTION_FOLLOW_REMOVE_SUCCESS:
    case types.POST_FICTION_UP_REMOVE_SUCCESS:
      return { ...state, [action.data.type]: 'none' };
    default:
      return state;
  }
};
const ratings = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.FETCHING:
      return {};
    case types.GET_COMMENT_COMMENTS_SUCCESS:
    case types.GET_COMMENT_REPLIES_SUCCESS:
    case types.GET_FICTION_COMMENTS_SUCCESS:
    case types.GET_FICTION_REVIEWS_SUCCESS:
    case types.GET_FICTION_TYPOS_SUCCESS:
    case types.GET_TYPO_TYPOS_SUCCESS:
      return { ...state, ...action.data.ratings };
    case types.GET_AUTHOR_WORKS_SUCCESS:
    case types.GET_CHAPTER_SUCCESS:
    case types.GET_DASHBOARD_SUCCESS:
    case types.GET_FICTION_SUCCESS:
    case types.GET_HOME_SUCCESS:
    case types.GET_UNIVERSE_SUCCESS:
      return action.data.ratings;
    case types.POST_CHAPTER_DOWN_REMOVE_SUCCESS:
    case types.POST_CHAPTER_THANKS_REMOVE_SUCCESS:
    case types.POST_CHAPTER_UP_REMOVE_SUCCESS:
    case types.POST_CHAPTER_DOWN_SUCCESS:
    case types.POST_CHAPTER_THANKS_SUCCESS:
    case types.POST_CHAPTER_UP_SUCCESS:
    case types.POST_COMMENT_DOWN_SUCCESS:
    case types.POST_COMMENT_DOWN_REMOVE_SUCCESS:
    case types.POST_COMMENT_UP_SUCCESS:
    case types.POST_COMMENT_UP_REMOVE_SUCCESS:
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
      return { ...state, [action.data.id]: rating(state[action.data.id], action) };
    case types.POST_REVIEW_SUCCESS: {
      const type = ['overall', 'style', 'grammar', 'story', 'characters'];
      const review = action.data.comments[action.data.id];
      return {
        ...state, [action.activeFiction]: {
          ...state[action.activeFiction], ratings: type.map(t => review.score[t] ? review.score[t] : 0).filter(r => r > 0)
        }
      };
    }
    case types.POST_REVIEW_EDIT_SUCCESS:
      const type = ['overall', 'style', 'grammar', 'story', 'characters'];
      return {
        ...state, [action.activeFiction]: {
          ...state[action.activeFiction], ratings: type.map(t => action.data.score[t] ? action.data.score[t] : 0)
        .filter(r => r > 0) }
      };
    default:
      return state;
  }
};

const status = (
  state = '',
  action
) => 
  action.type.includes('_RATING') ?
    action.type.includes('_REQUEST') ?  `${action.type} is in process...` :
    action.type.includes('_FAILURE') ? `${(action.type).replace('_FAILURE', '')} has failed: ${action.error}` :
    action.type.includes('_SUCCESS') ? '' :
    state : state;
;

const ratingReducer = combineReducers({
  ratings,
  status
});

export default ratingReducer;