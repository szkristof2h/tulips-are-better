import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Link from '../components/Link';
import classNames from 'classnames/bind';
import styles from '../css/components/fiction-related';
import { toDate } from '../utils/misc';

import placeholder from "../images/cover.png";

const cx = classNames.bind(styles);

export default class FictionRelated extends PureComponent {
  render() {
    const { cover, series, title } = this.props;
    return (
      <div className={cx('related')}>
        <img className={cx('cover')} src={cover ? cover : placeholder} alt="cover" />
        <div className={cx('header', 'ellipsis')}>{title}</div>
        <ul className={cx('series')}>
          {series.map((s, i) =>
            <li className={cx('container')} key={s} >
              <div className={cx('num')}>#{i + 1}</div>
              <Link
                className={cx('title', 'ellipsis')}
                type='fiction'
                action='fiction'
                data={{ id: s.id, title: s.title }}
                name={`${s.title} ${i != series.length - 1 ? '(' + series[i + 1].type + ')' : ''}`} />
              <div className={cx('year')}>{toDate(s.createdAt, 'year')}</div>
            </li>
          )}
        </ul>
      </div>
    );
  }
}

FictionRelated.propTypes = {
  cover: PropTypes.string,
  series: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired
};