import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import comment from '../reducers/comment';
import editor from '../reducers/editor';
import fiction from '../reducers/fiction';
import list from '../reducers/list';
import message from '../reducers/message';
import navigation from '../reducers/navigation';
import popup from '../reducers/popup';
import rating from '../reducers/rating';
import statistics from '../reducers/statistics';
import user from '../reducers/user';

const isFetching = (state = true, action) => action.type.includes('_REQUEST') ? true : 
  action.type.includes('_SUCCESS') ? false : state;

  
const api = (state = {}, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

// Combine reducers with routeReducer which keeps track of
// router state
const rootReducer = combineReducers({
  api,
  comment,
  editor,
  fiction,
  list,
  isFetching,
  message,
  navigation,
  popup,
  rating,
  routing,
  statistics,
  user
});

export default rootReducer;
