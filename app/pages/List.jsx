import React, { Component } from 'react';
import Page from '../pages/Page';
import ListContainer from '../containers/List';

class Lists extends Component {
  getMetaData() {
    return {
      title: this.pageTitle(),
      meta: this.pageMeta(),
      link: this.pageLink()
    };
  }

  pageTitle = () => {
    return 'List | Tulips Are Better';
  };

  pageMeta = () => {
    return [
      { name: 'description', content: 'List of ...' }
    ];
  };

  pageLink = () => {
    return [];
  };

  render() {
    return (
      <Page {...this.getMetaData()}>
        <ListContainer {...this.props} />
      </Page>
    );
  }
}

export default Lists;

