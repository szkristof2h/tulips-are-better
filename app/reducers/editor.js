import { combineReducers } from 'redux';
import * as types from '../types';

const authors = (state = [], action) => {
  switch (action.type) {
    case types.FETCHING:
    case types.GET_SUBMIT_SUCCESS:
    case types.POST_EDITOR_SUBMIT_SUCCESS:
      return [];
    case types.GET_EDITOR_CHOOSE_PARENT_SUCCESS:
      return action.data.authors;
    case types.POST_EDITOR_ADD_AUTHOR_SUCCESS:
      let exists = false;
      state.forEach(a => {if (a.id === action.data.id) exists = true;});

      return exists ? state.map(a => a.id !== action.data.id ? a :
        { ...a, positions: [...a.positions, ...action.data.positions.filter(p => !a.positions.includes(p))]}
      ) :
      [...state, { id: action.data.id, name: action.data.name, positions: action.data.positions }];
    case types.REMOVE_AUTHOR:
      return state.filter((a, i) => i !== action.data.index);
    default:
      return state;
  }
};

const autoIndex = (state = true, action) => {
  switch (action.type) {
    case types.FETCHING:
    case types.GET_SUBMIT_SUCCESS:
    case types.POST_EDITOR_SUBMIT_SUCCESS:
      return true;
    case types.SET_AUTOINDEX:
      return !state;
    default:
      return state;
  }
};

const isDraft = (state = false, action) => {
  switch (action.type) {
    case types.FETCHING:
    case types.GET_SUBMIT_SUCCESS:
    case types.POST_EDITOR_SUBMIT_SUCCESS:
      return false;
    case types.SET_DRAFT:
      return !state;
    default:
      return state;
  }
};

const indexes = (state = { normal: 0 }, action) => {
  switch (action.type) {
    case types.EDIT_REVIEW:
      return action.data.length == 1 ? { normal: 1 } : { overall: 1, style: 1, grammar: 2, story: 3, characters: 4 };
    case types.FETCHING:
    case types.GET_CHAPTER_SUCCESS:
    case types.GET_FICTION_SUCCESS:
    case types.GET_FICTION_COMMENTS_SUCCESS:
    case types.GET_FICTION_REVIEWS_SUCCESS:
    case types.GET_FICTION_TYPOS_SUCCESS:
    case types.GET_SUBMIT_SUCCESS:
    case types.POST_EDITOR_SUBMIT_SUCCESS:
    case types.POST_REVIEW_EDIT_SUCCESS:
      return { normal: 0 };
    case 'EDITOR_LOAD_MORE':
      return { ...state, ...{ [action.data.type]: Object.keys(state).length } };
    case 'EDITOR_LOAD_MORE_REVIEW':
      return { ...state, ...{ style: 1, grammar: 2, story: 3, characters: 4 } };
    default:
      return state;
  }
};

const isFetching = (state = '', action) => {
  switch (action.type) {
    case types.GET_SUBMIT_SUCCESS:
      return 'submit_loaded';
    case types.FETCHING:
      return 'unloaded';
    default:
      return state;
  }
};

const parents = (state = [], action) => {
  switch (action.type) {
    case types.FETCHING:
      return [];
    case types.GET_SUBMIT_SUCCESS:
      return action.data.parents;
    default:
      return state;
  }
};

const settings = (state = { formatting: [true], isPasting: false, preview: [false] }, action) => {
  switch (action.type) {
    case types.FETCHING:
    case types.GET_CHAPTER_SUCCESS:
    case types.GET_FICTION_SUCCESS:
    case types.GET_FICTION_COMMENTS_SUCCESS:
    case types.GET_FICTION_REVIEWS_SUCCESS:
    case types.GET_FICTION_TYPOS_SUCCESS:
    case types.GET_SUBMIT_SUCCESS:
    case types.POST_EDITOR_SUBMIT_SUCCESS:
    case types.POST_REVIEW_EDIT_SUCCESS:
      return { ...state, formatting: [true], preview: [false] };
    case types.EDIT_REVIEW:
      return { ...state, preview: state.preview.map((p, i) => i === action.data.index ? !p : p) };
    case 'EDITOR_PREVIEW':
      return { ...state, preview: state.preview.map((p, i) => i === action.data.index ? !p : p) };
    case 'KEEP_FORMATTING':
      return { ...state, formatting: state.formatting.map((f, i) => i === action.data.index ? !f : f) };
    case 'EDITOR_LOAD_MORE':
      return { ...state, ...{ formatting: [...state.formatting, true], preview: [...state.preview, false] } };
    case 'EDITOR_LOAD_MORE_REVIEW':
      return { ...state, ...{ formatting: [...state.formatting, ...Array(4).fill(true)],
        preview: [...state.preview, ...Array(4).fill(false)] } };
    case 'PASTING':
      return { ...state, isPasting: action.isPasting };
    default:
      return state;
  }
};

const status = (
  state = '',
  action
) =>
  action.type.includes('EDTIOR') ?
    action.type.includes('_REQUEST') ? `${action.type} is in process...` :
    action.type.includes('_FAILURE') ? `${(action.type).replace('_FAILURE', '')} has failed: ${action.error}` :
    action.type.includes('_SUCCESS') ? '' :
    state : state;
;

const texts = (state = [''], action) => {
  switch (action.type) {
    case types.TYPING:
      return state.map((a, i) => i === action.index ? action.value : a);
    case types.FETCHING:
    case types.GET_CHAPTER_SUCCESS:
    case types.GET_FICTION_SUCCESS:
    case types.GET_FICTION_COMMENTS_SUCCESS:
    case types.GET_FICTION_REVIEWS_SUCCESS:
    case types.GET_FICTION_TYPOS_SUCCESS:
    case types.POST_COMMENT_SUCCESS:
    case types.POST_COMMENT_EDIT_SUCCESS:
    case types.POST_REVIEW_SUCCESS:
    case types.POST_REVIEW_EDIT_SUCCESS:
      return [''];
    case types.EDIT_COMMENT:
    case types.EDIT_REVIEW:
      return action.data.text;
    case types.GET_SUBMIT_SUCCESS:
    case types.POST_EDITOR_SUBMIT_SUCCESS:
      return [''];
    case 'EDITOR_LOAD_MORE':
      return [...state, ''];
    case 'EDITOR_LOAD_MORE_REVIEW':
      return [...state, ...Array(4).fill('')];
    default:
      return state;
  }
};

const title = (state = '', action) => {
  switch (action.type) {
    case 'REMOVE_TITLE':
      return '';
    case 'TYPING_TITLE':
      return action.value;
    case types.EDIT_REVIEW:
      return action.data.title;
    case types.FETCHING:
    case types.GET_CHAPTER_SUCCESS:
    case types.GET_FICTION_SUCCESS:
    case types.GET_FICTION_COMMENTS_SUCCESS:
    case types.GET_FICTION_REVIEWS_SUCCESS:
    case types.GET_FICTION_TYPOS_SUCCESS:
    case types.GET_SUBMIT_SUCCESS:
    case types.POST_EDITOR_SUBMIT_SUCCESS:
    case types.POST_REVIEW_EDIT_SUCCESS:
      return '';
    default:
      return state;
  }
};

const type = (state = '', action) => {
  switch (action.type) {
    case types.FETCHING:
      return '';
    case types.GET_CHAPTER_SUCCESS:
    case types.GET_CONVERSATION_SUCCESS:
    case types.GET_FICTION_SUCCESS:
    case types.GET_FICTION_COMMENTS_SUCCESS:
    case types.GET_FICTION_REVIEWS_SUCCESS:
    case types.GET_FICTION_TYPOS_SUCCESS:
    case types.GET_SUBMIT_SUCCESS:
    case types.POST_EDITOR_SUBMIT_SUCCESS:
      return action.data.type;
    case types.GET_DASHBOARD_SUCCESS:
      return 'comments';
    default:
      return state;
  }
};

const values = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_CATEGORY':
      return { ...state, categories: state.categories.map((c, i) => i === action.data.index ? !c : c) }
    case types.CHOOSE_SCHEDULE_TYPE:
      return { ...state, scheduleType: action.data.type[action.data.id] }
    case types.CHOOSE_VOLUME:
      return { ...state, volume: action.data.id }
    case types.GET_EDITOR_CHOOSE_PARENT_SUCCESS:
      return { ...state, parent: action.data.index, chapterCount: action.data.chapterCount, volumeCount: action.data.volumeCount,
        volume: action.data.volumes.length-1 }
    case types.CHOOSE_VOLUME:
    case types.FETCHING:
      return {};
    case types.EDIT_COMMENT:
      return { edit: true, id: action.data.id };
    case 'EDITOR_LOAD_MORE_REVIEW':
      return { ...state, ratings: state.ratings.concat([0, 0, 0, 0]) };
    case types.EDIT_REVIEW:
      return { edit: true, id: action.data.id, ratings: action.data.score };
    case types.GET_CHAPTER_SUCCESS:
    case types.GET_DASHBOARD_SUCCESS:
    case types.GET_FICTION_SUCCESS:
    case types.POST_COMMENT_SUCCESS:
    case types.POST_COMMENT_EDIT_SUCCESS:
      return { origin: '', replyTo: '' };
    case types.GET_FICTION_REVIEWS_SUCCESS:
      return { ratings: [0, 0, 0, 0, 0] };
    case types.GET_SUBMIT_SUCCESS:
    case types.POST_EDITOR_SUBMIT_SUCCESS:
      return { categories: Array(16).fill(false), followerChapters: 0, parent: -1,
        schedule: Array(7).fill([0, 0]), scheduleType: 'weekly', tags: '',
        volume: -1
      };
    case types.POST_REVIEW_SUCCESS:
    case types.POST_REVIEW_EDIT_SUCCESS:
      return { hasReview: true };
    case 'RATE_REVIEW':
      return { ...state, ratings: state.ratings.map((r, i) => i !== action.data.index ? r : action.data.rating) };
    case 'REMOVE_TITLE':
      return { ...state, origin: '', replyTo: '' };
    case types.SET_FOLLOWER_CHAPTER:
      return { ...state, followerChapters: action.data.num };
    case 'SET_REPLY':
      return { ...state, origin: action.data.origin, replyTo: action.data.replyTo };
    case 'TYPING_SCHEDULE':
      const index = parseInt(action.index, 10);
      return { ...state, schedule: state.schedule.map((s, i) => Math.floor(Math.abs(index/2)) == i ? index % 2 == 0 ?
        [action.value, s[1]] : [s[0], action.value] : s) };
    case 'TYPING_TAG':
      return { ...state, tags: action.value };
    default:
      return state;
  }
};

const volumes = (state = [], action) => {
  switch (action.type) {
    case types.FETCHING:
      return [];
    case types.GET_EDITOR_CHOOSE_PARENT_SUCCESS:
      return action.data.volumes ? action.data.volumes : [];
    default:
      return state;
  }
};

const editorReducer = combineReducers({
  authors,
  autoIndex,
  indexes,
  isDraft,
  isFetching,
  parents,
  settings,
  status,
  texts,
  title,
  type,
  values,
  volumes
});

export default editorReducer;