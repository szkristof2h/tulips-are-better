import { combineReducers } from 'redux';
import * as types from '../types';

// unused currently
const notifications = (state = [], action) => {
  switch (action.type) {
    case '':
      return {
      };
    default:
      return state;
  }
};

const navigationReducer = combineReducers({
  notifications
});

export default navigationReducer;