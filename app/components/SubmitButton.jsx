import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Link from '../components/Link';
import styles from '../css/components/submit-button';

import add_w40 from "../images/add_w40.png";

const cx = classNames.bind(styles);

export default class SubmitButton extends Component {
  render() {
    const { errors, submission, type } = this.props;
    
    if (errors.length == 0) {
      return (
        <Link
          className={cx('load-button')}
          type='editor'
          action={!submission.edit ? 'submit' : 'confirm_edit'}
          data={submission}
          name=''>
          <img className={cx('icon')} alt="add" title="add" src={add_w40} />
          <div className={cx('b-text')}>{`${!submission.edit ? 'SUBMIT' : 'EDIT'} ${type.toUpperCase()}`}</div>
        </Link>
      );
    }

    return (
      <div className={cx('errors')}>{errors.map((e, i) =>
        <div key={'sBE' + e} className={cx('error')}>{e}</div>
      )}</div>
    )
  }
}

SubmitButton.propTypes = {
  errors: PropTypes.array,
  submission: PropTypes.object,
  type: PropTypes.string.isRequired
};
