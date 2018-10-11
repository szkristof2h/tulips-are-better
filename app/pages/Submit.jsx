import React, { Component } from 'react';
import Page from '../pages/Page';
import SubmitContainer from '../containers/Submit';

class Submit extends Component {
  getMetaData() {
    return {
      title: this.pageTitle(),
      meta: this.pageMeta(),
      link: this.pageLink()
    };
  }

  pageTitle = () => {
    return 'Submit | Tulips Are Better';
  };

  pageMeta = () => {
    return [
      { name: 'description', content: 'Submit a new universe, series, book, volume or chapter.' }
    ];
  };

  pageLink = () => {
    return [];
  };

  render() {
    return (
      <Page {...this.getMetaData()}>
        <SubmitContainer {...this.props} />
      </Page>
    );
  }
}

export default Submit;

