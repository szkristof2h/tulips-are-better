import React, { Component } from 'react';
import Page from '../pages/Page';
import ConversationsContainer from '../containers/Conversations';

class Conversations extends Component {
  getMetaData() {
    return {
      title: this.pageTitle(),
      meta: this.pageMeta(),
      link: this.pageLink()
    };
  }

  pageTitle = () => {
    return 'Messages | Tulips Are Better';
  };

  pageMeta = () => {
    return [
      { name: 'description', content: 'Your conversations' }
    ];
  };

  pageLink = () => {
    return [];
  };

  render() {
    return (
      <Page {...this.getMetaData()}>
        <ConversationsContainer {...this.props} />
      </Page>
    );
  }
}

export default Conversations;

