import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Navigation from '../containers/Navigation';
import Notice from '../components/Notice';
import Message from '../containers/Message';
import Popup from '../containers/Popup';
import styles from '../css/main';

const cx = classNames.bind(styles);


/*
 * React-router's <Router> component renders <Route>'s
 * and replaces `this.props.children` with the proper React Component.
 *
 * Please refer to `routes.jsx` for the route config.
 *
 * A better explanation of react-router is available here:
 * https://github.com/rackt/react-router/blob/latest/docs/Introduction.md
 */
const App = ({ children }) => {
  return (
    <div className={cx('app')}>
      <Notice />
      {children}
      <Navigation />
      <Message />
      <Popup children={children}/>
    </div>
  );
};

App.propTypes = {
  children: PropTypes.object
};

export default App;
