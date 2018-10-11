import { apiEndpoint } from '../../config/app';
import createRestApiClient from '../utils/createRestApiClient';

const client = createRestApiClient().withConfig({ baseURL: apiEndpoint });

// Used only when loading a page
export function getFetch(action, url, params, dispatch) {
  dispatch({ type: 'FETCHING' });
  dispatch({ type: action + '_REQUEST' });
    
    return client.request({ method: 'GET', url: `${url}/${params}`})
      .then(response => dispatch({ type: action + '_SUCCESS', data: response.data }))
      .catch(err => {
        console.log('Err (getF - ' + action + '): ' + JSON.stringify(err.response.data));
        dispatch({ type: action + '_FAILURE', error: err.response.data });
      });
}

export function get(action, url) {
  return (dispatch, getState) => {
    dispatch({ type: action + '_REQUEST' });

    return client.request({ method: 'GET', url })
      .then(response => {
        const { fiction: { activeFiction }, user: { activeUser }, statistics: { activeStat } } = getState();
        dispatch({
          type: action + '_SUCCESS',
          data: response.data,
          activeFiction,
          activeUser,
          activeStat
        });
      })
      .catch((err) => {
        console.error('Err (get - ' + action + '): ' + err.response.data);
        dispatch({ type: action + '_FAILURE', error: err.response.data });
    });
  };
}

export function normal (action, data) {
  return dispatch => {

    return dispatch({
      type: action,
      data: data,
      error: action.includes('_FAILURE') ? data.error : ''
    });
  }
}

export function post(action, url, data) {
  return (dispatch, getState) => {
    dispatch({ type: action + '_REQUEST' });

    return client.request({ method: 'POST', url, data })
      .then(response => {
        const { fiction: { activeFiction }, user: { activeUser }, statistics: { activeStat } } = getState();
        dispatch({
          type: action + '_SUCCESS',
          data: response.data,
          activeFiction,
          activeUser,
          activeStat
        });
      })
      .catch(err => {
        console.error('Err (post - ' + action + '): ' + err.response.data);
        dispatch({ type: action + '_FAILURE', error: err.response.data });
      });
  };
}