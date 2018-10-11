import React, { Component } from 'react';
import Page from '../pages/Page';
import ChapterContainer from '../containers/Chapter';

class Chapter extends Component {
  getMetaData() {
    return {
      title: this.pageTitle(),
      meta: this.pageMeta(),
      link: this.pageLink()
    };
  }

  pageTitle = () => {
    return 'Chapter | Tulips Are Better';
  };

  pageMeta = () => {
    return [
      { name: 'description', content: 'A chapter of...' }
    ];
  };

  pageLink = () => {
    return [];
  };

  render() {
    return (
      <Page {...this.getMetaData()}>
        <ChapterContainer {...this.props} />
      </Page>
    );
  }
}

export default Chapter;

