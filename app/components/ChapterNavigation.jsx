import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Link from '../components/Link';
import classNames from 'classnames/bind';
import styles from '../css/components/chapter-navigation';

const cx = classNames.bind(styles);

import read from "../images/fiction/read_w60.png";

export default class ChapterNavigation extends Component {
  render() {
    const { id, book, next, num, previous } = this.props;
    const type = previous === 'none' && next === 'none' ? 'full' : previous === 'none' ? 'left' : next === 'none' ?
      'right' : '';

    return (
      <div className={cx('navigation')}>
        {previous !== 'none' ? <Link
          className={cx('button')}
          type='fiction'
          action={previous !== 'none' ? 'chapter' : 'no_chapter'}
          data={{ id: previous, num: num-1, book: book }}
          name=''>
          <img className={cx('')} alt="previous chapter" title="previous chapter" src={read} />
        </Link> : ''}
        <Link
          className={cx('b-text', type)}
          type='fiction'
          action='fiction'
          data={{ id, title: book }}
          name='FICTION PAGE' />
        {next !== 'none' ? <Link
          className={cx('button')}
          type='fiction'
          action={next !== 'none' ? 'chapter' : 'no_chapter'}
          data={{ id: next, num: num + 1, book }}
          name=''>
          <img className={cx('')} alt="next chapter" title="next chapter" src={read} />
        </Link> : ''}
      </div>
          
    );
  }
}

ChapterNavigation.propTypes = {
  id: PropTypes.string.isRequired,
  book: PropTypes.string.isRequired,
  next: PropTypes.string.isRequired,
  num: PropTypes.number.isRequired,
  previous: PropTypes.string.isRequired
};