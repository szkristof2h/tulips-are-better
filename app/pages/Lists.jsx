import React, { Component } from 'react';
import Page from '../pages/Page';
import ListsContainer from '../containers/Lists';

class Lists extends Component {
  getMetaData() {
    return {
      title: this.pageTitle(),
      meta: this.pageMeta(),
      link: this.pageLink()
    };
  }

  pageTitle = () => {
    return 'Lists | Tulips Are Better';
  };

  pageMeta = () => {
    return [
      { name: 'description', content: 'Your lists' }
    ];
  };

  pageLink = () => {
    return [];
  };

  render() {
    return (
      <Page {...this.getMetaData()}>
        <ListsContainer {...this.props} />
      </Page>
    );
  }
}

export default Lists;

