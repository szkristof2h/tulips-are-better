import passport from 'passport';
import unsupportedMessage from '../db/unsupportedMessage';
import { controllers, passport as passportConfig } from '../db';

const usersController = controllers && controllers.users;

const relay = (req, res) => {
  const type = req.url.split("/")[1];
  const action = req.url.split("/")[3];

  switch (type) {
    case "articles":
      switch (action) {
        case "comments":
          req.params.id = 'articles/' + req.params.id;
          req.params.pType = 'chapter';
          return controllers.comments.getComments(req, res, null, null, null);
        case "volume": return controllers.fictions.getChildren(req, res, null, null, null, null);
        case "typos":
          req.params.id = `articles/${req.params.id}`;
          req.params.type = 'typos';
          req.params.pType = 'chapter';
          return controllers.comments.getComments(req, res, null, null, null);
      };
    case "comments":
      switch (action) {
        case "replies": {
          req.params.id = `comments/${req.params.id}`;
          req.params.pType = 'chapter';
          return controllers.comments.getReplies(req, res, null, null, null)
        };
      };
    case "conversations":
      switch (action) {
        case "star": return controllers.conversations.filterConversation(req, res, 'starred', true);
        case "trash": return controllers.conversations.filterConversation(req, res, 'trashed', true);
        case "unstar": return controllers.conversations.filterConversation(req, res, 'starred', false);
        case "untrash": return controllers.conversations.filterConversation(req, res, 'trashed', false);
      };
    case "dashboard":
      req.params.id = 'fictions/' + req.params.id;
      req.params.pType = 'chapter';
      return controllers.comments.getComments(req, res, null, null, null);      
    case "fictions":
      switch (action) {
        case "comments":
          req.params.id = `fictions/${req.params.id}`;
          req.params.pType = 'book';
          return controllers.comments.getComments(req, res, null, null, null);
        case "reviews": return controllers.fictions.getReviews(req, res);
        case "typos":
          req.params.type = 'typos';
          return controllers.comments.getComments(req, res, null, null, null);
        case "volume": return controllers.fictions.getChildren(req, res, null, null, null, null);
        case "volumes": return controllers.fictions.getChildren(req, res, null, null, null, null);
      };
    case "reviews":
      switch (action) {
        case "replies": {
          req.params.id = `reviews/${req.params.id}`;
          return controllers.comments.getReplies(req, res, null, null, null);
        }
      };
    case "users":
      switch (action) {
        case "friends": return controllers.users.getFriends(req, res, null, null, null);
      };
    case "getUniverse":
      req.params.type = 'fictions';
      return controllers.fictions.getUniverse(req, res, null, null, null, null);
    case "getAuthor":// unused
      req.params.type = 'fictions';
      return controllers.fictions.getAuthorsWorks(req, res, null, null, null, null);
  };
};

export default (app) => {
  // user routes
  app.post('/:type/rating/:ph/:id', controllers.misc.postRating);
  app.post('/remove/rating/:id', controllers.misc.removeRating);

  app.get('/getHome', controllers.fictions.getHome);

  app.post('/report/:type', controllers.misc.report);

  // NOT IMPLEMENTED
  app.post('/add/list', controllers.misc.notImplemented);
  app.get('/chapters/users/:id/:offset/:draft', controllers.misc.notImplemented);
  app.get('/conversations/join', controllers.misc.notImplemented);
  app.get('/conversations/new', controllers.misc.notImplemented);
  app.get('/edit/fictions/:id', controllers.misc.notImplemented);// to change (fiction)
  app.get('/edit/fictions/:id', controllers.misc.notImplemented);
  app.get('/users/:id/favorites/:offset', controllers.misc.notImplemented);
  app.get('/users/:id/chapters/:offset', controllers.misc.notImplemented);
  app.get('/users/:id/message', controllers.misc.notImplemented);
  app.get('/users/:id/report', controllers.misc.notImplemented);
  app.get('/users/:id/reviews/:offset', controllers.misc.notImplemented);


  // COMMENTS
  app.get('/comments/:id/replies/:offset', relay);
  app.get('/reviews/:id/replies/:offset', relay);
  app.get('/fictions/:id/comments/:offset', relay);
  app.get('/articles/:id/comments/:offset', relay);
  app.get('/articles/:id/typos/:offset', relay);
  app.get('/fictions/:id/reviews/:offset', controllers.fictions.getReviews);

  app.get('/dashboard/fictions/:id/:type/:offset', relay);
  
  app.get('/getUserConversations', controllers.conversations.getConversations);
  app.get('/getConversation/:id/:offset', controllers.conversations.getConversation);
  app.get('/getConversations/:id/:type', controllers.conversations.getConversations);
  app.get('/conversations/:id/:offset', controllers.conversations.getConversations);
  app.get('/conversations/inbox', controllers.conversations.getConversations);
  app.get('/conversations/:type', controllers.conversations.getConversations);

  app.post('/conversations/:id/delete', controllers.conversations.removeConversation);
  app.post('/conversations/:id/star', relay);
  app.post('/conversations/:id/trash', relay);
  app.post('/conversations/:id/unstar', relay);
  app.post('/conversations/:id/untrash', relay);
  //app.get('/getMessages/:id/:offset/:', controllers.conversation.getConversations);

  // CHAPTERS
  app.get('/getChapter/:id', controllers.articles.getArticle);

  // EDITOR
  app.get('/getSubmit/:type', controllers.fictions.getSubmit);
  app.post('/editor/add/author', controllers.users.getUserName);
  app.get('/editor/choose/parent/:id/:index', controllers.fictions.getChooseParent);
  // app.post('/editor/edit/book', controllers.fictions.updateBook);
  app.post('/editor/edit/comment', controllers.comments.updateComment);
  app.post('/editor/edit/review', controllers.fictions.updateReview);
  app.post('/editor/submit/book', controllers.fictions.postBook);
  app.post('/editor/submit/chapter', controllers.articles.postArticle);
  app.post('/editor/submit/comment', controllers.comments.postComment);
  app.post('/editor/submit/typo', controllers.comments.postComment);
  app.post('/editor/submit/review', controllers.fictions.postReview);
  app.post('/editor/submit/volume', controllers.fictions.postVolume);

  // FICTIONS
  app.get('/getDashboard/book/:id', controllers.fictions.getDashboard);
  app.get('/getDashboard/book/:id/children/:childrenFrom', controllers.fictions.getDashboard);
  app.get('/getDashboard/book/:id/chapters/:childrenFrom/:chaptersFrom', controllers.fictions.getDashboard);
  app.get('/getDashboard/book/:id', controllers.fictions.getDashboard);
  app.get('/getDashboard/universe/:id', controllers.fictions.getUniverse);
  app.get('/getDashboard/series/:id', controllers.fictions.getUniverse);
  app.get('/getAuthor/:id/:offset/:draft', controllers.users.getAuthorsWorks);
  app.get('/getFiction/:id', controllers.fictions.getBook);
  app.get('/getUniverse/:id', relay);
  app.get('/:type/:id/volume', relay);
  app.get('/:type/:id/volumes', relay);

  // LISTS
  app.get('/getUserLists', controllers.list.getLists);
  app.get('/getLists/:id/:offset', controllers.list.getLists);
  app.get('/getList/:id/:offset', controllers.list.getList);
  app.get('/getNotifications', controllers.list.getNotifications);
  app.post('/delete/list', controllers.list.removeList);
  app.post('/delete/list_item', controllers.list.removeFromList);

  // USERS
  app.get('/getWorks/:offset', controllers.users.getAuthorsWorks);
  app.get('/getUser/:id', controllers.users.getProfile);
  app.get('/user/:name/:id/works', relay);// get author works
  app.post('/friend/:id/remove', controllers.users.removeFriend);
  app.get('/getProfile', controllers.users.getProfile);
  app.get('/users/:id/friends/:offset', relay);
  app.post('/users/:id/add', controllers.users.postAddFriend);
};
