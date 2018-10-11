import React from 'react';
import { Route, IndexRoute } from 'react-router';
import {
  About, App, AuthorPage, Chapter, Conversation, Conversations, Fiction, FictionDashboard, Home, List, Lists,
  LoginOrRegister, Notifications, Profile, Submit } from './pages';

/*
 * @param {Redux Store}
 * We require store as an argument here because we wish to get
 * state from the store after it has been authenticated.
 */
export default (store) => {
  const requireAuth = (nextState, replace, callback) => {
    const { user: { authenticated }} = store.getState();
    if (!authenticated) {
      replace({
        pathname: '/login',
        state: { nextPathname: nextState.location.pathname }
      });
    }
    callback();
  };

  const redirectAuth = (nextState, replace, callback) => {
    const { user: { authenticated }} = store.getState();
    if (authenticated) {
      replace({
        pathname: '/'
      });
    }
    callback();
  };

  return (
    <Route path="/" component={App}>
      <IndexRoute component={Home} urls={['/getHome']} />
      <Route path="browse/:asd/:asdd" component={List} />

      <Route path="users/:id/favorites/:skip" component={List} urls={['/getFavorites']} />
      <Route path="users/:id/lists/:offset" component={Lists} urls={['/getLists']} />
      <Route path="lists" component={Lists} urls={['/getUserLists']} />
      <Route path="messages" component={Conversations} urls={['/getUserConversations']} />
      <Route path="users/:id/messages/:type" component={Conversations} urls={['/getConversations']} />
      <Route path="users/:id/reviews/:skip" component={List} urls={['/getReviews']} />
      <Route path="works/:offset" component={AuthorPage} urls={['/getWorks']} />
      <Route path="dashboard/:type/:id" component={FictionDashboard} urls={['/getDashboard']} />

      <Route path="message/:id/:offset" component={Conversation} urls={['/getConversation']} />

      <Route path=":title/chapter/:num/:id" component={Chapter} urls={['/getChapter']} />

      <Route path="user/:id/:skip/:draft" component={List} urls={['/getAuthor']} />
      <Route path="chapters/:id/:skip/:draft" component={List} urls={['/getAuthorChapters']} />
      <Route path="fiction/:book/:id" component={Fiction} urls={['/getFiction']} />
      <Route path="list/:title/:id/:offset" component={List} urls={['/getList']} />
      <Route path="universe/:title/:id" component={List} urls={['/getUniverse']} />
      <Route path="series/:title/:id" component={List} urls={['/getUniverse']} />
      <Route path="user/:title/:id" component={Profile} urls={['/getUser']} />
      <Route path="profile" component={Profile} urls={['/getProfile']} />
      <Route path="notifications" component={Notifications} urls={['/getNotifications']} />
      <Route path="submit/:type" component={Submit} urls={['/getSubmit']} />

      {//<Route path="login" component={LoginOrRegister} onEnter={redirectAuth} />
      }
      <Route path="about" component={About} />
    </Route>
  );
};
