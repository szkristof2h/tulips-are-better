import React, { Component } from 'react';
import Page from '../pages/Page';
import ConversationContainer from '../containers/Conversation';

class Conversation extends Component {
  getMetaData() {
    return {
      title: this.pageTitle(),
      meta: this.pageMeta(),
      link: this.pageLink()
    };
  }

  pageTitle = () => {
    return 'Message | Tulips Are Better';
  };

  pageMeta = () => {
    return [
      { name: 'description', content: 'A conversation between...' }
    ];
  };

  pageLink = () => {
    return [];
  };

  render() {
    return (
      <Page {...this.getMetaData()}>
        <ConversationContainer {...this.props} />
      </Page>
    );
  }
}

export default Conversation;

