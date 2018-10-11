import React, { Component } from 'react';
import Page from '../pages/Page';
import FictionDashboardContainer from '../containers/FictionDashboard';

class FictionDashboard extends Component {
  getMetaData() {
    return {
      title: this.pageTitle(),
      meta: this.pageMeta(),
      link: this.pageLink()
    };
  }

  pageTitle = () => {
    return 'Fiction dashboard | Tulips Are Better';
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
        <FictionDashboardContainer {...this.props} />
      </Page>
    );
  }
}

export default FictionDashboard;

