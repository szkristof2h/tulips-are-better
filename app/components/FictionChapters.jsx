import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames/bind';
import styles from '../css/components/fiction-chapters';
import Link from '../components/Link';
import { toDate } from '../utils/misc';

const cx = classNames.bind(styles);

export default class FictionChapters extends Component {
  render() {
    const { chapters, fiction, selected, selecting, volumeIds, volumes } = this.props;
    const volumeO = { id: selected };

    return (
      <div className={cx('toc')}>
        <div className={cx('header', 'ellipsis')}>
          <Link
            className={cx('title', 'ellipsis', { flipped: selecting })}
            type={'fiction'}
            action={selecting ? 'close_volumes' : 'volumes'}
            data={volumeO}
            name=''>
            {'#' + (volumeIds.indexOf(selected)+1) + ' ' + volumes[selected].title}
          </Link>
          <div className={cx('container', { hide: !selecting })}>
            <ul className={cx('select')}>
              {volumeIds.map((v, i) =>
                <li className={cx('option', 'ellipsis', { selected: v === selected })}  key={v}>
                  <Link
                    className={cx('container')}
                    type='fiction'
                    action='volume'
                    data={{ id: volumes[v].start }}
                    name={`#${i+1} ${volumes[v].title}`} />
                </li>
              )}
            </ul>
          </div>
        </div>
        <ul className={cx('chapters')}>
          {volumes[selected].chapterIds.map((c, i) =>
          <li className={cx('chapter')} key={c}>
            <Link
              className={cx('container')}
              type='fiction'
              action='chapter'
              data={{ id: c.replace('articles/', ''), book: fiction, num: i+1 }}
              name=''>
              <div className={cx('num')}>#{i+1}</div>
                <div className={cx('title', 'ellipsis')}>{chapters[c].title}</div>
                <div className={cx('date')}>{toDate(chapters[c].createdAt)}</div>
            </Link>
          </li>
          )}
        </ul>
      </div>
    );
  }
}

FictionChapters.propTypes = {
  chapters: PropTypes.object.isRequired,
  fiction: PropTypes.string.isRequired,
  selected: PropTypes.string.isRequired,
  selecting: PropTypes.bool.isRequired,
  volumeIds: PropTypes.array.isRequired,
  volumes: PropTypes.object.isRequired
};