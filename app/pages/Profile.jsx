import React, { Component } from 'react';
import Page from '../pages/Page';
import ProfileContainer from '../containers/Profile';

class Profile extends Component {
  getMetaData() {
    return {
      title: this.pageTitle(),
      meta: this.pageMeta(),
      link: this.pageLink()
    };
  }

  pageTitle = () => {
    return 'Profile | Tulips Are Better';
  };

  pageMeta = () => {
    return [
      { name: 'description', content: 'Your profile' }
    ];
  };

  pageLink = () => {
    return [];
  };

  render() {
    return (
      <Page {...this.getMetaData()}>
        <ProfileContainer {...this.props} />
      </Page>
    );
  }
}

export default Profile;

