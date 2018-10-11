import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import styles from '../css/components/navigation';
import Main from '../components/Main';

const cx = classNames.bind(styles);

const Navigation = () => {
    return (
      <nav className={cx('sidebar')} role="navigation">
        <Main />
      </nav>
    );
};

Navigation.propTypes = {
  
};

function mapStateToProps(state) {
  return {
    
  };
}

export default connect(mapStateToProps, null)(Navigation);
