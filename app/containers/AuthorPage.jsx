import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import requiredIf from 'react-required-if';
import Link from '../components/Link';
import classNames from 'classnames/bind';
import styles from '../css/components/author-page';

import logo from "../images/logo.png";

import cover from "../images/cover.png";
import comments_w20 from "../images/fiction/w20/comment_w20.png";
import donate_w20 from "../images/fiction/w20/donate_w20.png";
import followers_w20 from "../images/fiction/w20/followers_w20.png";
import favorites_w20 from "../images/fiction/w20/favorites_w20.png";


const cx = classNames.bind(styles);

class AuthorPage extends Component {
  render() {
    const { activeFiction, currentUser, children, isFetching, fiction, stats, users } = this.props;

    if (isFetching !== 'works_loaded') return <div>LOADING...</div>;
    if (!fiction.childrenIds || fiction.childrenIds.length === 0) return <div>You don't have any fictions yet.</div>;// Add button for creating one

    return (
      <div className={cx('main')}>
        <img className={cx('logo')} src={logo} />
        <ul className={cx('works')}>
          {fiction.childrenIds.map((f, i) =>
            <li key={`aP${f}${i}`} className={cx('work')}>
              <Link
                className={cx('cover')}
                type='fiction'
                action='dashboard'
                data={{ id: f, type: children[f].type  }}
                name='' >
                  <img className={cx('icon')} alt="fiction cover" title="cover" src={cover} />
              </Link>
              <div className={cx('details')}>
                <div className={cx('container')}>
                  <Link
                    className={cx('header', 'ellipsis')}
                    type='fiction'
                    action='dashboard'
                    data={{ id: f, type: children[f].type }}
                    name={children[f].title} />
                  <div className={cx('placeholder')}></div>
                  <img className={cx('')} alt="followers" title="followers" src={followers_w20} />
                  <div className={cx('d-text')}>{stats[children[f].statId].follow}</div>
                  <img className={cx('')} alt="favorites" title="favorites" src={favorites_w20} />
                  <div className={cx('d-text')}>
                    {children[f].type === 'book' ? stats[children[f].statId].favorite : '-'}
                  </div>
                  <img className={cx('')} alt="comments" title="comments" src={comments_w20} />
                  <div className={cx('d-text')}>
                    {children[f].type === 'book' ? stats[children[f].statId].favorite : '-'}
                  </div>
                  <img className={cx('')} alt="pages" title="pages" src={donate_w20} />
                  <div className={cx('d-text')}>
                    {children[f].type === 'book' && stats[children[f].statId].donations ? 
                      stats[children[f].statId].donations
                     : '-'}</div>
                  <div className={cx('placeholder')}></div>
                </div>
              </div>
              <div className={cx('views')}>
                <div className={cx('container')}>
                  <div className={cx('header')}>Yearly</div>
                  <div className={cx('d-text')}>
                    {children[f].type === 'book' ? stats[children[f].statId].views.complete.yearly : '-'}
                  </div>
                </div>
                <div className={cx('container')}>
                  <div className={cx('header')}>Monthly</div>
                  <div className={cx('d-text')}>
                    {children[f].type === 'book' ? stats[children[f].statId].views.complete.monthly : '-'}
                  </div>
                </div>
                <div className={cx('container')}>
                  <div className={cx('header')}>Weekly</div>
                  <div className={cx('d-text')}>
                    {children[f].type === 'book' ? stats[children[f].statId].views.complete.weekly : '-'}
                  </div>
                </div>
                <div className={cx('container')}>
                  <div className={cx('header')}>Daily</div>
                  <div className={cx('d-text')}>
                    {children[f].type === 'book' ? stats[children[f].statId].views.complete.daily : '-'}
                  </div>
                </div>
              </div>
            </li>
          )}
          <li>
            <Link
              className={cx('expand')}
              type='fiction'
              action='more_works'
              data={{ offset: fiction.childrenIds.length }}
              name='Load more...' />
          </li>
        </ul>
    </div>
    );
  }
}

AuthorPage.propTypes = {
  activeFiction: requiredIf(PropTypes.string, props => props.isFetching === 'works_loaded'),
  children: requiredIf(PropTypes.object, props => props.isFetching === 'works_loaded'),
  currentUser: requiredIf(PropTypes.string, props => props.isFetching === 'works_loaded'),
  fiction: requiredIf(PropTypes.object, props => props.isFetching === 'works_loaded'),
  isFetching: PropTypes.string.isRequired,
  stats: requiredIf(PropTypes.object, props => props.isFetching === 'works_loaded'),
  users: requiredIf(PropTypes.object, props => props.isFetching === 'works_loaded')
};

function mapStateToProps(state) {
  return state.fiction.isFetching !== 'works_loaded' ? { isFetching: state.fiction.isFetching } : {
    activeFiction: state.fiction.activeFiction,
    children: state.fiction.childrenById,
    currentUser: state.user.currentUser.id,
    fiction: state.fiction.fictionsById[state.fiction.activeFiction],
    isFetching: state.fiction.isFetching,
    stats: state.statistics.statisticsById,
    users: state.user.usersById
  };
}

export default connect(mapStateToProps, null)(AuthorPage);