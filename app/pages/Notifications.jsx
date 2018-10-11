import React, { Component } from 'react';
import Page from '../pages/Page';
import NotificationsContainer from '../containers/Notifications';

class Notifications extends Component {
  getMetaData() {
    return {
      title: this.pageTitle(),
      meta: this.pageMeta(),
      link: this.pageLink()
    };
  }

  pageTitle = () => {
    return 'Notifications | Tulips Are Better';
  };

  pageMeta = () => {
    return [
      { name: 'description', content: 'Your notifications' }
    ];
  };

  pageLink = () => {
    return [];
  };

  render() {
    return (
      <Page {...this.getMetaData()}>
        <NotificationsContainer {...this.props} />
      </Page>
    );
  }
}

export default Notifications;

