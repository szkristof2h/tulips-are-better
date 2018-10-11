import { combineReducers } from 'redux';
import * as types from '../types';


const input = (state = { author: '', positions: [] }, action) => {
  switch (action.type) {
    case 'TYPING_POPUP':
      return { ...state, author: action.value };
    case 'CHOOSE_POSITION':
      if (!state.positions.includes(action.data.position)) return {
        ...state, positions: [...state.positions, action.data.position]
      };

      return { ...state, positions: state.positions.filter(p => p !== action.data.position) };
    case types.POST_EDITOR_ADD_AUTHOR_SUCCESS:
    case types.CHOOSE_PARENT:
    case types.CLOSE_POPUP:
    case types.DASHBOARD_STAT_CHOOSE_CONFIRM:
    case types.FETCHING:
    case '@@router/LOCATION_CHANGE':
      return { author: '', positions: [] };
    default:
      return state;
  }
};

const status = (state = {}, action) => {
  switch (action.type) {
    case types.CLOSE_POPUP:
    case types.CHOOSE_VOLUME:
    case types.CHOOSE_SCHEDULE_TYPE:
    case types.DASHBOARD_STAT_CHOOSE_CONFIRM:
    case types.FETCHING:
    case types.GET_EDITOR_CHOOSE_PARENT_SUCCESS:
    case types.GET_FICTION_REVIEWS_SUCCESS:
    case types.POST_COMMENT_CONFIRM_REPORT_FAILURE:
    case types.POST_COMMENT_CONFIRM_REPORT_SUCCESS:
    case types.POST_FICTION_CONFIRM_REPORT_FAILURE:
    case types.POST_FICTION_CONFIRM_REPORT_SUCCESS:
    case types.POST_REVIEW_SUCCESS:
    case types.POST_REVIEW_EDIT_SUCCESS:
    case types.POST_EDITOR_ADD_AUTHOR_SUCCESS:
    case '@@router/LOCATION_CHANGE':
      return {};
    case 'COMMENT_REPORT':
      return {
        action: 'confirm_report',
        data: { ids: [0, 1, 2, ], reason: ['spamming', 'flaming', 'hate speech'], type: Array(3).fill('comment') },
        id: action.data.id,
        type: 'comment',
        title: 'Reason for reporting:',
        color: 'blue',
        width: 300,
        list: ['Spamming', 'Flaming', 'Hate speech'],
        index: 1
      };
    case 'FICTION_REPORT':
      return {
        action: 'confirm_report',
        data: { ids: [0, 1, 2,], reason: ['spamming', 'flaming', 'hate speech'], type: Array(3).fill('fiction') },
        id: action.data.id,
        type: 'fiction',
        title: 'Reason for reporting:',
        color: 'blue',
        width: 300,
        list: ['Spamming', 'Flaming', 'Hate speech'],
        index: 1
      };
    case types.DASHBOARD_STAT_CHOOSE:
      return {
        action: action.data.action,
        data: action.data.data,
        type: action.data.type,
        title: action.data.title,
        color: action.data.color,
        width: 300,
        list: action.data.list,
        index: 1,
        draft: false
      };
    case types.NAVIGATION_ADD:
      return {
        action: 'confirm_add',
        data: { ids: [0, 1, 2], type: ['book', 'volume', 'chapter'] },
        //data: { ids: [0, 1, 2, 3, 4], type: ['universe', 'series', 'book', 'volume', 'chapter'] },
        type: 'navigation',
        title: 'Post a new:',
        color: 'blue',
        width: 300,
        list: ['Book', 'Volume', 'Chapter'],
        //list: ['Universe', 'Series', 'Book', 'Volume', 'Chapter'],
        index: 1,
        draft: false
      };
    case types.OPEN_ADD_AUTHOR:
      return {
        color: 'blue',
        width: 520
      };
    case types.OPEN_CHOOSE_PARENT:
    case types.OPEN_CHOOSE_VOLUME:
      return {
        action: action.data.action,
        data: action.data.data,
        type: action.data.type,
        title: action.data.title,
        color: action.data.color,
        width: 350,
        list: action.data.list,
        index: 1
      };
    case types.OPEN_RATE:
      return {
        id: action.data.id,
        hasReview: action.data.hasReview,
        parentId: action.data.parentId,
        ratings: action.data.ratings,
        title: 'Rate the fiction:',
        types: ['overall', 'style', 'grammar', 'story', 'characters'],
        color: 'blue',
        width: 450
      };
    case types.OPEN_SCHEDULE_TYPE:
      return {
        action: 'choose_schedule_type',
        data: { ids: [0, 1, 2], type: ['weekly', 'bi-weekly', 'monthly'] },
        type: 'editor',
        title: 'Choose a schedule type:',
        color: 'blue',
        width: 400,
        list: ['weekly', 'bi-weekly', 'monthly']
      };
    case types.POPUP_RATE_REVIEW:
      return { ...state, ratings: state.ratings.map((r, i) => i === action.data.index ? action.data.rating : r) };
    case types.POST_CHAPTER_SUCCESS:
    case types.POST_CHAPTER_UPDATE_SUCCESS:
    case types.POST_FICTION_SUCCESS:
    case types.POST_FICTION_UPDATE_SUCCESS:
    case types.POST_EDITOR_SUBMIT_SUCCESS:
      return {
        action: action.data.id.includes('fictions') ? 'fiction' : 'chapter',
        data: { book: [action.data.book], ids: [action.data.id], num: [action.data.num], title: [action.data.title] },
        type: 'fiction',
        title: `${action.data.id.includes('fictions') ? 'Fiction' : 'Chapter'} successfully ${action.data.update ? 'updated' : 'posted'}!`,
        color: 'blue',
        width: 400,
        list: [action.data.title]
      };
    default:
      return state;
  }
};

const type = (state = '', action) => {
  switch (action.type) {
    case types.OPEN_ADD_AUTHOR:
      return 'addAuthor';
    case types.OPEN_CHOOSE_PARENT:
      return 'fiction-list';
    case types.OPEN_RATE:
      return 'rating';
    case types.CLOSE_POPUP:
    case types.CHOOSE_VOLUME:
    case types.CHOOSE_SCHEDULE_TYPE:
    case types.DASHBOARD_STAT_CHOOSE_CONFIRM:
    case types.GET_EDITOR_CHOOSE_PARENT_SUCCESS:
    case types.POST_REVIEW_SUCCESS:
    case types.POST_REVIEW_EDIT_SUCCESS:
    case types.POST_EDITOR_ADD_AUTHOR_SUCCESS:
    case types.FETCHING:
    case '@@router/LOCATION_CHANGE':
      return '';
    default:
      return state;
  }
};

const popupReducer = combineReducers({
  input,
  status,
  type
});

export default popupReducer;