import React, { Component } from 'react';
import Page from '../pages/Page';
import AuthorPageContainer from '../containers/AuthorPage';

class AuthorPage extends Component {
  constructor(props) {
    super(props);
  }

  getMetaData() {
    return {
      title: this.pageTitle(),
      meta: this.pageMeta(),
      link: this.pageLink()
    };
  }

  pageTitle = () => {
    return 'AuthorPage | Tulips Are Better';
  };

  pageMeta = () => {
    return [
      { name: 'description', content: 'A list of your submitted works.' }
    ];
  };

  pageLink = () => {
    return [];
  };

  render() {
    return (
      <Page {...this.getMetaData()}>
        <AuthorPageContainer {...this.props} />
      </Page>
    );
  }
}

export default AuthorPage;

