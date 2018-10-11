import * as types from '../types';

export function typing(text, index, type) {
  return {
    type: type === 'editor' ? types.TYPING : type === 'editor-title' ? 'TYPING_TITLE' :  type === 'editor-tags' ? 
      'TYPING_TAG' : type === 'editor-schedule' ? 'TYPING_SCHEDULE' : 'TYPING_POPUP',
    index,
    value: text
  };
}

export function pasting(isPasting, index) {
  return {
    type: 'PASTING',
    index,
    isPasting
  };
}
