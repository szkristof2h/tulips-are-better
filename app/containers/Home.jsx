import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import requiredIf from 'react-required-if';
import classNames from 'classnames/bind';
import styles from '../css/components/home';
import Link from '../components/Link';
import TextBox from '../components/TextBox';
import Article from '../components/Article';

import cover from "../images/cover.png";
import logo from "../images/logo.png";
import read from "../images/works.png";

const cx = classNames.bind(styles);

class Home extends Component {
  render() {
    const { activeFiction, chapters, chapterIds, currentUser, expanded, featuredIds, fictions, fictionIds, isFetching,
      ratings,
      statistics, users } = this.props;

    if (isFetching !== 'home_loaded') return <div>LOADING...</div>;
    
    let empty = [];
    for (let i = 0; i < 6 - fictionIds.length; i++) {
      empty.push(<div key={`fE${i}`} className={cx('empty')}></div>);
    }

    return (
      <div className={cx('main')}>
        <img className={cx('logo')} src={logo} />
        <ul className={cx('featured-updates')}>
          {featuredIds.map((f, i) => 
            i < 3 && chapters[f].featured && <Article
              key={`aCF${f}${i}`}
              id={chapters[f].id}
              author={users[chapters[f].authorIds[0]].name}
              authorId={users[chapters[f].authorIds[0]].id}
              book={chapters[f].parents[1]}
              chapter={chapters[f]}
              commentCount={statistics[chapters[f].statId].commentCount}
              createdAt={chapters[f].createdAt}
              featured={true}
              downed={'none'}
              downvotes={statistics[chapters[f].statId].downs}
              expanded={expanded.includes(`f${f}`)}
              title={chapters[f].title}
              upped={'none'}
              upvotes={statistics[chapters[f].statId].ups}
              volume={chapters[f].parents[0].num}
              />)
          }
        </ul>
        <div className={cx('slider')}>
          <img className={cx('thumbnail', 'selected')} src={cover} />
          <div className={cx('selector')}>
            {fictionIds.map((f, i) => 
            <Link
              key={`sCo${f}${i}`}
              className={cx('container')}
              type='fiction'
              action='slider'
              data={{ id: f }}
              name=''>
                <img className={cx('thumbnail')} src={cover} />
            </Link>

            )}
            {empty.map(e => e)}
            <div className={cx('placeholder')}></div>
          </div>
          <div className={cx('details')}>
            <div className={cx('title')}>
              {fictions[activeFiction].title} 
            </div>
            <div className={cx('categories')}>
              ({fictions[activeFiction].categories.map(c => c + ' ')})
            </div>
            <Link 
              className={cx('button')}
              type='fiction'
              action='book'
              data={{ id: activeFiction, title: fictions[activeFiction].title }}
              name=''>
              <img className={cx('b-icon')} src={read} />
            </Link>
          </div>
          <TextBox className={cx('text', 'summary')} value={fictions[activeFiction].summary} />
        </div>
        <div className={cx('article-list')}>
          {chapterIds.map((f, i) =>
            <Article
              key={`aCL${f}${i}`}
              id={chapters[f].id}
              author={users[chapters[f].authorIds[0]].name}
              authorId={users[chapters[f].authorIds[0]].id}
              book={chapters[f].parents[1]}
              chapter={chapters[f]}
              commentCount={statistics[chapters[f].statId].commentCount}
              createdAt={chapters[f].createdAt}
              featured={false}
              downed={ratings[f] ? ratings[f].down ? ratings[f].down : 'none' : 'none'}
              downvotes={statistics[chapters[f].statId].down}
              expanded={expanded.includes(f)}
              title={chapters[f].title}
              upped={ratings[f] ? ratings[f].up ? ratings[f].up : 'none' : 'none'}
              upvotes={statistics[chapters[f].statId].up}
              volume={chapters[f].parents[0].num}
            />)
          }
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  activeFiction: requiredIf(PropTypes.string, props => props.isFetching === 'home_loaded'),
  chapters: requiredIf(PropTypes.object, props => props.isFetching === 'home_loaded'),
  chapterIds: requiredIf(PropTypes.array, props => props.isFetching === 'home_loaded'),
  currentUser: requiredIf(PropTypes.string, props => props.isFetching === 'home_loaded'),
  featuredIds: requiredIf(PropTypes.array, props => props.isFetching === 'home_loaded'),
  fictions: requiredIf(PropTypes.object, props => props.isFetching === 'home_loaded'),
  fictionIds: requiredIf(PropTypes.array, props => props.isFetching === 'home_loaded'),
  isFetching: PropTypes.string.isRequired,
  ratings: requiredIf(PropTypes.object, props => props.isFetching === 'home_loaded'),
  expanded: requiredIf(PropTypes.array, props => props.isFetching === 'home_loaded'),
  statistics: requiredIf(PropTypes.object, props => props.isFetching === 'home_loaded'),
  users: requiredIf(PropTypes.object, props => props.isFetching === 'home_loaded')
};

function mapStateToProps(state) {
  return state.fiction.isFetching !== 'home_loaded' ? { isFetching: state.fiction.isFetching } : {
    activeFiction: state.fiction.activeFiction,
    chapters: state.fiction.chaptersById,
    chapterIds: state.fiction.chapterIds,
    currentUser: state.user.currentUser.id,
    expanded: state.fiction.expanded,
    featuredIds: state.fiction.chapterIds,
    fictions: state.fiction.fictionsById,
    fictionIds: state.fiction.fictionIds,
    isFetching: state.fiction.isFetching,
    ratings: state.rating.ratings,
    statistics: state.statistics.statisticsById,
    users: state.user.usersById
  };
}

export default connect(mapStateToProps, null)(Home);