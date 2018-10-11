import { getFetch as get } from '../actions/api';

const actionNames = {
  '/getAuthor': 'GET_AUTHOR_WORKS',
  '/getChapter': 'GET_CHAPTER',
  '/getConversation': 'GET_CONVERSATION',
  '/getConversations': 'GET_CONVERSATIONS',
  '/getDashboard': 'GET_DASHBOARD',
  '/getFiction': 'GET_FICTION',
  '/getHome': 'GET_HOME',
  '/getList': 'GET_LIST',
  '/getLists': 'GET_LISTS',
  '/getNotifications': 'GET_NOTIFICATIONS',
  '/getSubmit': 'GET_SUBMIT',
  '/getUniverse': 'GET_UNIVERSE',
  '/getUser': 'GET_USER',
  '/getUserConversations': 'GET_CONVERSATIONS',
  '/getUserLists': 'GET_LISTS',
  '/getProfile': 'GET_USER',
  '/getWorks': 'GET_WORKS'
};

const paramsList = {
  '/getAuthor': ['id', 'skip', 'draft'],
  '/getChapter': ['id'],
  '/getConversation': ['id', 'offset'],
  '/getConversations': ['id', 'type'],
  '/getDashboard': ['type', 'id'],
  '/getFiction': ['id'],
  '/getHome': [],
  '/getList': ['id', 'offset'],
  '/getLists': ['id', 'offset'],
  '/getSubmit': ['type'],
  '/getNotifications': [],
  '/getUniverse': ['id'],
  '/getUser': ['id'],
  '/getUserConversations': [],
  '/getUserLists': [],
  '/getProfile': [],
  '/getWorks': ['offset']
};

// Made it so that you can add multiple urls for a page fetch in routes.jsx, it'll go through each of them and dispatch an
// action for each as well, but I'm not sure it was a good idea. Besides I ended up not even needing it. (Will probably redo the whole thing sometime)
export function fetchData(urls, params, dispatch){
  const addPromise = function add(url) {
    let n = '';
    paramsList[url].forEach(p => {
      if(params.hasOwnProperty(p)) n += params[p] + '/';
    });
    
    return get(actionNames[url], url, n, dispatch);
  };

  const actions = urls.map(addPromise); // run the function over all items.
  const results = Promise.all(actions); // pass array of promises

  return results.then(r => {
    return r;
  }).catch(err => {
    console.log('Fetch dispatch error: ' + err);
  });
}

export default fetchData;