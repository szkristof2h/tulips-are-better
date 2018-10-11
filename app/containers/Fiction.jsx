import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import requiredIf from 'react-required-if';
import Link from '../components/Link';
import classNames from 'classnames/bind';
import styles from '../css/components/fiction';

import Comments from '../containers/Comments';
import FictionBox from '../components/FictionBox';
import FictionRelated from '../components/FictionRelated';
import FictionChapters from '../components/FictionChapters';
import Schedule from '../components/Schedule';

import logo from "../images/logo.png";
import info from "../images/info.png";
import rate from "../images/fiction/rate_w60.png";
const cx = classNames.bind(styles);

class Fiction extends Component {
  render() {
    const { chaptersById, childrenById, childrenIds, fiction, isFetching, id, ownReview, ratings, users,
      selecting, statistics } = this.props;
    if (isFetching !== 'fiction_loaded') return <div>LOADING...</div>;
    
    const authors = fiction.authorIds.map((a, i) => ({// redo it
      id: a,
      position: fiction.positions[i],
      name: users[a].name,
      link: users[a].link
    }));
    return (
      <div className={cx('main')}>
        <img className={cx('logo')} src={logo} />
        <div className={cx('fiction')}>
          <FictionBox
            id={fiction.id}
            title={fiction.title}
            authorNote={fiction.authorNote}
            authors={authors}
            categories={fiction.categories}
            tags={fiction.tags}
            updatedAt={fiction.updatedAt}
            createdAt={fiction.createdAt}
            chapters={statistics[fiction.statId].chapterCount}
            downed={ratings.down === 'none' ? 'none' : ratings.down}
            downvotes={statistics[fiction.statId].down}
            favorites={statistics[fiction.statId].favorite}
            favorited={ratings.favorite === 'none' ? 'none' : ratings.favorite}
            followed={ratings.follow === 'none' ? 'none' : ratings.follow}
            followers={statistics[fiction.statId].follow}
            frequency={fiction.frequency}
            pages={statistics[fiction.statId].pages}
            popularity={statistics[fiction.statId].popularity}
            rating={statistics[fiction.statId].rating}
            rated={ratings.ratings}
            reviewId={ownReview ? ownReview.id : null}
            scheduleType={fiction.scheduleType}
            start={fiction.start}
            status={fiction.status}
            subscribed={ratings.subscribtion}
            subscribers={statistics[fiction.statId].subscribers}
            summary={fiction.body}
            upped={ratings.up === 'none' ? 'none' : ratings.up}
            upvotes={statistics[fiction.statId].up}
            views={statistics[fiction.statId].views}
          />
          <Schedule schedule={fiction.schedule} scheduleType={fiction.scheduleType} type='normal' />
          <div className={cx('more')}>
            {fiction.parent.length > 1 ? <Link
              className={cx('container')}
              type={'fiction'}
              action={'universe'}
              data={{
                fId: id.replace('fictions/', ''),
                id: fiction.parent[1].id.replace('fictions/', '') ,
                title: fiction.parent[1].title
              }}
              name=''>
              <img className={cx('icon')} src={info} alt="info" />
              <div className={cx('title')}>
                <em>{fiction.parent[1].title} </em> UNIVERSE
                </div>
            </Link> :
            <div className={cx('container')}>
              <img className={cx('icon')} src={info} alt="info" />
              <div className={cx('title')}>
                <em>NO UNIVERSE YET</em>
              </div>
            </div>
            }
            <Link className={cx('container')}
              type={'user'}
              action={'fictions'}
              data={{ id: authors[0].id.replace('users/', ''), name: authors[0].name }}
              name=''>
              <img className={cx('icon')} src={rate} alt="author" />
              <div className={cx('title')}>MORE FROM {authors[0].name.toUpperCase()}</div>
            </Link>
          </div>
          {fiction.parent.length != 0 &&
            <FictionRelated
              //cover={fiction.parent[0].thumbnail}
              title={fiction.parent[0].title}
              series={fiction.series}
            />
          }
          {Object.keys(chaptersById).length != 0 && <FictionChapters
            chapters={chaptersById}
            fiction={fiction.title}
            fictionId={fiction.id}
            selected={fiction.selectedChild}
            selecting={selecting}
            volumeIds={fiction.childrenIds}
            volumes={childrenById}
          />}
          <Comments />
        </div>
      </div>
    );
  }
}

Fiction.propTypes = {
  chaptersById: requiredIf(PropTypes.object, props => props.isFetching === 'fiction_loaded'),
  childrenById: requiredIf(PropTypes.object, props => props.isFetching === 'fiction_loaded'),
  fiction: requiredIf(PropTypes.object, props => props.isFetching === 'fiction_loaded'),
  id: requiredIf(PropTypes.string, props => props.isFetching === 'fiction_loaded'),
  isFetching: PropTypes.string.isRequired,
  ownReview: PropTypes.object,
  ratings: requiredIf(PropTypes.object, props => props.isFetching === 'fiction_loaded'),
  selecting: requiredIf(PropTypes.bool, props => props.isFetching === 'fiction_loaded'),
  statistics: requiredIf(PropTypes.object, props => props.isFetching === 'fiction_loaded'),
  users: PropTypes.object
};

function mapStateToProps(state) {
  return state.fiction.isFetching !== 'fiction_loaded' ? { isFetching: state.fiction.isFetching } : {
    chaptersById: state.fiction.chaptersById,
    childrenById: state.fiction.childrenById,
    fiction: state.fiction.fictionsById[state.fiction.activeFiction],
    id: state.fiction.activeFiction,
    isFetching: state.fiction.isFetching,
    ownReview: state.fiction.ownReview,
    ratings: state.rating.ratings[state.fiction.activeFiction],
    selecting: state.fiction.selecting,
    statistics: state.statistics.statisticsById,
    users: state.user.usersById
  };
}

export default connect(mapStateToProps, null)(Fiction);