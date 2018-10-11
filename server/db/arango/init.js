import db from './connect';

// If one .then fails the others won't be executed, but as these functions are only supposed to be successful on the
// first run when the collections & graphs don't yet exist, this will be ignored for now.
// JournalSizes are more of a guess and might be highly inaccurate, will have to see it in production

function createCollections() {
  return db.collection('articles').create({ waitForSync: true })
    .then(() => db.collection('comments').create({ waitForSync: true }))
    .then(() => db.collection('conversations').create({ waitForSync: true, journalSize: 4 * 1024 * 1024 }))
    .then(() => db.collection('fictions').create({ waitForSync: true }))
    .then(() => db.collection('lists').create({ waitForSync: true, journalSize: 8 * 1024 * 1024 }))
    .then(() => db.collection('reviews').create({ waitForSync: true, journalSize: 4 * 1024 * 1024 }))
    .then(() => db.collection('statistics').create({ waitForSync: true, journalSize: 16 * 1024 * 1024 }))
    .then(() => db.collection('users').create({ waitForSync: true }))
    .then(() => db.collection('views').create({ waitForSync: true, journalSize: 16 * 1024 * 1024 }))
    .catch(err => console.error('ERROR creating collections: ' + err));
}

function createEdgeCollections() {
  return db.edgeCollection('authorOf').create({ waitForSync: true, journalSize: 8 * 1024 * 1024 })
    .then(() => db.edgeCollection('permissionTo').create({ waitForSync: true, journalSize: 8 * 1024 * 1024 }))
    .then(() => db.edgeCollection('connectedTo').create({ waitForSync: true, journalSize: 4 * 1024 * 1024 }))
    .then(() => db.edgeCollection('nextTo').create({ waitForSync: true, journalSize: 16 * 1024 * 1024 }))
    .then(() => db.edgeCollection('replyTo').create({ waitForSync: true, journalSize: 8 * 1024 * 1024 }))
    .then(() => db.edgeCollection('commentTo').create({ waitForSync: true, journalSize: 16 * 1024 * 1024 }))
    .then(() => db.edgeCollection('parentTo').create({ waitForSync: true, journalSize: 16 * 1024 * 1024 }))
    .then(() => db.edgeCollection('messageOf').create({ waitForSync: true, journalSize: 8 * 1024 * 1024 }))
    .then(() => db.edgeCollection('inPM').create({ waitForSync: true, journalSize: 8 * 1024 * 1024 }))
    .then(() => db.edgeCollection('updateOf').create({ waitForSync: true, journalSize: 16 * 1024 * 1024 }))
    .then(() => db.edgeCollection('followerTo').create({ waitForSync: true }))
    .then(() => db.edgeCollection('listIn').create({ waitForSync: true, journalSize: 16 * 1024 * 1024 }))
    .then(() => db.edgeCollection('ratingTo').create({ waitForSync: true }))
    .then(() => db.edgeCollection('reportTo').create({ waitForSync: true, journalSize: 4 * 1024 * 1024  }))
    .then(() => db.edgeCollection('reviewTo').create({ waitForSync: true, journalSize: 4 * 1024 * 1024 }))
    .then(() => db.edgeCollection('statTo').create({ waitForSync: true, journalSize: 16 * 1024 * 1024 }))
    .then(() => db.edgeCollection('viewTo').create({ waitForSync: true, journalSize: 8 * 1024 * 1024 }))
    .catch(err => console.error('ERROR creating edge collections: ' + err));
}

function createGraphs() {
  return db.graph('authorsGraph').create({
    edgeDefinitions: [{
      collection: 'authorOf',
      from: ['users'],
      to: ['fictions', 'comments', 'articles', 'reviews']
    }]
  })
  .then(() => {
    db.graph('commentsGraph').create({
      edgeDefinitions: [{
        collection: 'commentTo',
        from: ['comments'],
        to: ['articles', 'fictions', 'reviews']
      }]
    });
  })
  .then(() => {
    db.graph('connectionsGraph').create({
      edgeDefinitions: [{
        collection: 'connectedTo',
        from: ['users'],
        to: ['users']
      }]
    });
  })
  .then(() => {
    db.graph('followsGraph').create({
      edgeDefinitions: [{
        collection: 'followerTo',
        from: ['users'],
        to: ['fictions', 'articles', 'comments', 'users']
      }]
    });
  })
  .then(() => {
    db.graph('listsGraph').create({
      edgeDefinitions: [{
        collection: 'listIn',
        from: ['users', 'lists'],
        to: ['lists', 'fictions']
      }]
    });
  })
  .then(() => {
    db.graph('messagesGraph').create({
      edgeDefinitions: [{
        collection: 'messageOf',
        from: ['conversations', 'comments'],
        to: ['comments']
      }]
    });
  })
  .then(() => {
    db.graph('nextToGraph').create({
      edgeDefinitions: [{
        collection: 'nextTo',
        from: ['fictions', 'articles'],
        to: ['fictions', 'articles']
      }]
    });
  })
  .then(() => {
    db.graph('parentsGraph').create({
      edgeDefinitions: [{
        collection: 'parentTo',
        from: ['fictions'],
        to: ['fictions', 'articles']
      }]
    });
  })
  .then(() => {
    db.graph('permissionsGraph').create({
      edgeDefinitions: [{
        collection: 'permissionTo',
        from: ['users'],
        to: ['fictions', 'articles', 'list']
      }]
    });
  })
  .then(() => {
    db.graph('pmsGraph').create({
      edgeDefinitions: [{
        collection: 'inPM',
        from: ['users'],
        to: ['conversations']
      }]
    });
  })
  .then(() => {
    db.graph('ratingsGraph').create({
      edgeDefinitions: [{
        collection: 'ratingTo',
        from: ['users'],
        to: ['fictions', 'articles', 'comments', 'reviews']
      }]
    });
  })
  .then(() => {
    db.graph('repliesGraph').create({
      edgeDefinitions: [{
        collection: 'replyTo',
        from: ['comments'],
        to: ['comments']
      }]
    });
  })
  .then(() => {
    db.graph('reportsGraph').create({
      edgeDefinitions: [{
        collection: 'reportTo',
        from: ['users'],
        to: ['fictions', 'articles', 'comments', 'conversations', 'reviews', 'users']
      }]
    });
  })
  .then(() => {
    db.graph('reviewsGraph').create({
      edgeDefinitions: [{
        collection: 'reviewTo',
        from: ['reviews'],
        to: ['fictions']
      }]
      });
  })
  .then(() => {
    db.graph('statsGraph').create({
      edgeDefinitions: [{
        collection: 'statTo',
        from: ['statistics'],
        to: ['fictions', 'articles', 'comments', 'reviews']
      }]
    });
  })
  .then(() => {
    db.graph('updatesGraph').create({
      edgeDefinitions: [{
        collection: 'updateOf',
        from: ['users'],
        to: ['fictions', 'articles', 'comments', 'users']
      }]
    });
  })
  .then(() => {
    db.graph('viewsGraph').create({
      edgeDefinitions: [{
        collection: 'viewTo',
        from: ['views'],
        to: ['fictions', 'articles', 'reviews']
      }]
    });
  }).catch(e => console.error('ERROR creating graphs: ' + err));
}

function createIndexes() {
  return db.collection('users').createIndex({ type: 'hash', fields: ['email'], unique: true})
    .then(() => db.collection('fictions').createIndex({ type: 'skiplist', fields: ['createdAt']}))
    .then(() => db.collection('fictions').createIndex({ type: 'skiplist', fields: ['childrenCount']}))
    .then(() => db.collection('fictions').createIndex({ type: 'skiplist', fields: ['type']}))
    .then(() => db.collection('fictions').createIndex({ type: 'skiplist', fields: ['title']}))
    .then(() => db.collection('fictions').createIndex({ type: 'skiplist', fields: ['categories[*]']}))
    .then(() => db.collection('fictions').createIndex({ type: 'skiplist', fields: ['tags']}))
    .then(() => db.collection('fictions').createIndex({ type: 'skiplist', fields: ['updatedAt']}))
    .then(() => db.collection('articles').createIndex({ type: 'skiplist', fields: ['createdAt']}))
    .then(() => db.collection('articles').createIndex({ type: 'skiplist', fields: ['title']}))
    .then(() => db.collection('comments').createIndex({ type: 'skiplist', fields: ['createdAt']}))
    .then(() => db.collection('conversations').createIndex({ type: 'skiplist', fields: ['createdAt']}))
    .then(() => db.collection('conversations').createIndex({ type: 'skiplist', fields: ['updatedAt']}))
    .then(() => db.collection('reviews').createIndex({ type: 'skiplist', fields: ['createdAt']}))
    .then(() => db.collection('lists').createIndex({ type: 'skiplist', fields: ['createdAt']}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['up']}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['down']}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['favorite']}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['follow']}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['thanks']}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['childrenCount']}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['mainCommentCount']}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['popularity']}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['rating[*]'], sparse: true }))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['ratingsCount']}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['reviewCount']}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['subscribers']}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['wordCount']}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['views.complete.complete'], sparse: true}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['views.complete.yearly'], sparse: true}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['views.complete.monthly'], sparse: true}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['views.complete.weekly'], sparse: true}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['views.complete.daily'], sparse: true}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['views.complete.averages'], sparse: true}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['views.uniques.complete'], sparse: true}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['views.uniques.yearly'], sparse: true}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['views.uniques.monthly'], sparse: true}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['views.uniques.weekly'], sparse: true}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['views.uniques.daily'], sparse: true}))
    .then(() => db.collection('statistics').createIndex({ type: 'skiplist', fields: ['views.uniques.averages'], sparse: true}))
    .then(() => db.collection('reviews').createIndex({ type: 'skiplist', fields: ['score.overall'], sparse: true}))
    .then(() => db.collection('reviews').createIndex({ type: 'skiplist', fields: ['score.story'], sparse: true}))
    .then(() => db.collection('reviews').createIndex({ type: 'skiplist', fields: ['score.writing'], sparse: true}))
    .then(() => db.collection('reviews').createIndex({ type: 'skiplist', fields: ['score.characters'], sparse: true}))
    .then(() => db.collection('reviews').createIndex({ type: 'skiplist', fields: ['score.grammar'], sparse: true}))
    .then(() => db.collection('views').createIndex({ type: 'skiplist', fields: ['createdAt']}))
    .then(() => db.collection('views').createIndex({ type: 'hash', fields: ['year']}))
    .then(() => db.collection('views').createIndex({ type: 'hash', fields: ['ip']}), { sparse: true })
    .then(() => db.edgeCollection('connectedTo').createIndex({ type: 'skiplist', fields: ['type']}))
    .then(() => db.edgeCollection('updateOf').createIndex({ type: 'skiplist', fields: ['createdAt']}))
    .then(() => db.edgeCollection('ratingTo').createIndex({ type: 'skiplist', fields: ['type']}))
    .catch(err => console.error('ERROR creating indexes: ' + err));

}

// Checks only for articles collection if exists to decide whether the database has been initialized or not.
// You could check for every collection and index individually to ensure accuracy, but it should be only initialized
// once at the beginning: if it didn't succeed you can easily just run it again.
export default function() {
  return db.collection('articles').exists()
    .then(r => r ? 'exists' : createCollections())
    .then(r => r === 'exists' ?  r : createEdgeCollections())
    .then(r => r === 'exists' ?  r : createGraphs())
    .then(r => r === 'exists' ?  r : createIndexes())
    .catch(err => console.error('Failed initializing the database: ' + err));
}