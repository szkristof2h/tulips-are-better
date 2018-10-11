import React, { Component } from 'react';
import Page from '../pages/Page';
import FictionContainer from '../containers/Fiction';

class Fiction extends Component {
  getMetaData() {
    return {
      title: this.pageTitle(),
      meta: this.pageMeta(),
      link: this.pageLink()
    };
  }

  pageTitle = () => {
    return 'Fiction | Tulips Are Better';
  };

  pageMeta = () => {
    return [
      { name: 'description', content: 'A reactGo example of a voting page' }
    ];
  };

  pageLink = () => {
    return [];
  };

  render() {
    return (
      <Page {...this.getMetaData()}>
        <FictionContainer {...this.props} />
      </Page>
    );
  }
}

export default Fiction;

