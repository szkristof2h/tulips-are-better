import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import requiredIf from 'react-required-if';
import Link from '../components/Link';
import classNames from 'classnames/bind';
import styles from '../css/components/fiction-dashboard';

import Comments from './Comments';
import { toDate } from '../utils/misc';

import cover from "../images/cover.png";
import stats_w40 from "../images/stats.png";
import delete_w40 from "../images/delete_w40.png";
import edit_w40 from "../images/fiction/edit_w40.png";
import logo from "../images/logo.png";

import comments_w20 from "../images/fiction/w20/comment_w20.png";
import followers_w20 from "../images/fiction/w20/followers_w20.png";
import favorites_w20 from "../images/fiction/w20/favorites_w20.png";
import donate_w20 from "../images/fiction/w20/donate_w20.png";
import rating_g20 from "../images/fiction/g20/rating_g20.png";
const cx = classNames.bind(styles);

class FictionDashboard extends Component {
  render() {
    const { activeFiction, chapters, children, currentUser, fiction, isFetching, showStats, statInfo,
      statistics, users } = this.props;

    if (isFetching !== 'dashboard_loaded') return <div>LOADING...</div>;

    // should redo/move
    const viewsElements = {
      yearly: [], monthly: [], weekly: [], daily: {}
    };
    const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
      'November', 'December'];
    const rTypes = ['overall', 'style', 'grammar', 'story', 'characters'];
    Object.keys(statistics[fiction.statId].views).forEach(y => {
      if (y !== 'uniques' &&y !== 'complete') {
        viewsElements.yearly.push(<div key={'yN' + y} className={cx('num')}>{y}</div>);
        viewsElements.yearly.push(<div key={'yV' + y} className={cx('num')}>
          {statistics[fiction.statId].views[y].complete}
        </div>);
        
        viewsElements.monthly.push(<div key={'yM' + y} className={cx('num')}>{y}</div>);
        for (let i = 0; i < 12; i++) {
          let v = statistics[fiction.statId].views[y].months[i+1];
          viewsElements.monthly.push(<div key={'vYM' + i} className={cx('num')}>{v ? v : '-'}</div>)
        }
        viewsElements.monthly.push(<div key={'pM' + y} className={cx('placeholder')}></div>);

        Object.keys(statistics[fiction.statId].views[y].weeks).forEach(w => {
          viewsElements.weekly.push(<div key={'wW' + w} className={cx('num')}>{`Week ${w}`}</div>);
          viewsElements.weekly.push(
            <div key={'wWN' + w} className={cx('num')}>{statistics[fiction.statId].views[y].weeks[w]}</div>);
        });

        Object.keys(statistics[fiction.statId].views[y].months).forEach(m => {
          const dateString = `${y}-${m.length == 1 ? '0' + m : m}-01`;
          const firstDay = new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          let mLength = m == 2 ? y - 2016%4 == 0 ? 29 : 28 : (m%2 == 1 && m < 8) || (m%2 == 0 && m > 7) ? 31 : 30;
          mLength + days.indexOf(firstDay);
          let offset = 1;
          viewsElements.daily[m] = [];
          for (let i = 0; i < mLength; i++) {
            const day = (i + offset) + '';
            let v = statistics[fiction.statId].views[y].days[m][day];
            if (i < days.indexOf(firstDay)) {
              offset--;
              mLength++;
              viewsElements.daily[m].push(<div key={`dD${i}${m}`} className={cx('num')}></div>);
            } else {
              viewsElements.daily[m].push(<div key={`dV${i}${m}`} className={cx('num')}>
                {v ? `${v} [${(day)}${day.slice(-1) == '1' ? 'st' : day.slice(-1) == '2' ? 'nd' :
                  day.slice(-1) == '3' ? 'rd' : 'th'}]` : '-'}</div>)
            }
          }
        });
      }
    });
    
    const { activeWeek, activeMonth, activeTab, activeYear } = statInfo;
    let counter = 0;
    return (
      <div className={cx('main')}>
        <img className={cx('logo')} src={logo} />
        <div className={cx('work')}>
          <Link
            className={cx('cover')}
            type='fiction'
            action='fiction'
            data={{ id: activeFiction, title: fiction.title }}
            name='' >
            <img className={cx('icon')} alt="fiction cover" title="cover" src={cover} />
          </Link>
          <div className={cx('details')}>
            <div className={cx('container')}>
              <Link
                className={cx('header', 'ellipsis')}
                type='fiction'
                action='fiction'
                data={{ id: activeFiction, title: fiction.title }}
                name={fiction.title} />
              <div className={cx('placeholder')}></div>
              <img className={cx('')} alt="followers" title="followers" src={followers_w20} />
              <div className={cx('d-text')}>{statistics[fiction.statId].follow}</div>
              <img className={cx('')} alt="favorites" title="favorites" src={favorites_w20} />
              <div className={cx('d-text')}>{fiction.type === 'book' ? statistics[fiction.statId].favorite : '-'}</div>
              <img className={cx('')} alt="comments" title="comments" src={comments_w20} />
              <div className={cx('d-text')}>{fiction.type === 'book' ? statistics[fiction.statId].favorite : '-'}</div>
              <img className={cx('')} alt="pages" title="pages" src={donate_w20} />
              <div className={cx('d-text')}>
                {fiction.type === 'book' && statistics[fiction.statId].donations ? statistics[fiction.statId].donations
                  : '-'}</div>
              <div className={cx('placeholder')}></div>
            </div>
            <Link
              className={cx('button')}
              type='fiction'
              action='edit_book'
              data={{ id: activeFiction }}
              name=''>
              <img className={cx('icon')} src={edit_w40} />
            </Link>
          </div>
          <div className={cx('views')}>
            <div className={cx('container')}>
              <div className={cx('header')}>Yearly</div>
              <div className={cx('d-text')}>
                {fiction.type === 'book' ? statistics[fiction.statId].views.complete.yearly : '-'}
              </div>
            </div>
            <div className={cx('container')}>
              <div className={cx('header')}>Monthly</div>
              <div className={cx('d-text')}>
                {fiction.type === 'book' ? statistics[fiction.statId].views.complete.monthly : '-'}
              </div>
            </div>
            <div className={cx('container')}>
              <div className={cx('header')}>Weekly</div>
              <div className={cx('d-text')}>
                {fiction.type === 'book' ? statistics[fiction.statId].views.complete.weekly : '-'}
              </div>
            </div>
            <div className={cx('container')}>
              <div className={cx('header')}>Daily</div>
              <div className={cx('d-text')}>
                {fiction.type === 'book' ? statistics[fiction.statId].views.complete.daily : '-'}
              </div>
            </div>
            <div className={cx('container')}>
              <div className={cx('header')}>Total</div>
              <div className={cx('d-text')}>
                {fiction.type === 'book' ? statistics[fiction.statId].views.complete.complete : '-'}
              </div>
            </div>
          </div>
        </div>
        <div className={cx('ratings')}>
          {rTypes.map((t, i) => 
            <div key={`rC${t}${i}`} className={cx('container')}>
              <div className={cx('header')}>{t}</div>
              <div className={cx('d-ratings')}>
                {statistics[fiction.statId].ratings[i].map((r, i) =>
                  <div key={`fR${r}${i}`} className={cx('container')}>
                    <div className={cx('placeholder')}></div>
                    <img className={cx('d-icon')} src={rating_g20} />
                    <div className={cx('d-num')}>{i+1}</div>
                    <div className={cx('d-rating')}>{r}</div>
                    <div className={cx('placeholder')}></div>
                  </div>
                )}
              </div>
              <div className={cx('d-average')}>
                {statistics[fiction.statId].rating[i]}
              </div>
            </div>
          )}

      </div>

        {fiction.childrenIds.length != 0 ? fiction.childrenIds.map((p, i) => <ul key={`fC${p}${i}`}
          className={cx('children')}>
          <li className={cx('header')}>
            <div className={cx('placeholder')}></div>
            <div className={cx('title')}>{`#${children[p].num} ${children[p].title}`}</div>
            <Link
              className={cx({ active: showStats === p })}
              type='dashboard'
              action={showStats !== p ? 'show_stats' : 'hide_stats'}
              data={{ id: p }}
              name=''>
              <img className={cx('icon')} src={stats_w40} />
            </Link>
          </li>
          <li className={cx('chapter')}>
            <div className={cx('container', 'header', { stat: showStats === p })}>
              <div className={cx('')}>{showStats !== p ? 'Num' : 'Num'}</div>
              <div className={cx('')}>{showStats !== p ? 'Title' : 'All'}</div>
              <div className={cx('')}>{showStats !== p ? 'Comments' : 'All (Unique)'}</div>
              <div className={cx('')}>{showStats !== p ? 'Comment by'  : 'Daily'}</div>
              <div className={cx('')}>{showStats !== p ? 'Edit' : 'Daily (Unique)'}</div>
              <div className={cx('')}>{showStats !== p ? 'Delete' : 'Average'}</div>
            </div>
          </li>
          {children[p].chapterIds.map((c, j) =>
            <li key={`fCha${c}${j}`} className={cx('chapter')}>
              {showStats !== p ?
              <div className={cx('container')}>
                <div className={cx('num')}>#{statistics[fiction.statId].chapterCount - (counter++)}</div>
                <Link
                  className={cx('d-text', 'ellipsis')}
                  type='fiction'
                  action='chapter'
                  data={{ id: c.replace('articles/', ''), book: fiction.title,
                    num: statistics[fiction.statId].chapterCount }}
                  name={chapters[c].title} />
                <div className={cx('')}>{statistics[chapters[c].statId].commentCount}</div>

                <div className={cx('')}>
                  {chapters[c].comment ? `${chapters[c].comment.by} (${toDate(chapters[c].comment.createdAt)})` : '-'}
                </div>
                <Link
                  className={cx('container')}
                  type='fiction'
                  action='edit_chapter'
                  data={{ id: c.replace('articles/', '') }}
                  name=''>
                  <img className={cx('icon')} src={edit_w40} />
                </Link>
                <Link
                  className={cx('container')}
                  type='fiction'
                  action='edit_chapter'
                  data={{ id: c.replace('articles/', '') }}
                  name=''>
                  <img className={cx('icon')} src={delete_w40} />
                </Link>
              </div> :
              <div className={cx('views')}>
                <div className={cx('num')}>#{statistics[fiction.statId].chapterCount - (counter++)}</div>
                <div className={cx('')}>{`${statistics[chapters[c].statId].views.complete.complete}`}</div>
                <div className={cx('')}>{`${statistics[chapters[c].statId].views.uniques.complete}`}</div>
                <div className={cx('')}>{`${statistics[chapters[c].statId].views.complete.daily}`}</div>
                <div className={cx('')}>{`${statistics[chapters[c].statId].views.uniques.daily}`}</div>
                <div className={cx('')}>{`${statistics[chapters[c].statId].views.complete.averages}`}</div>
            </div>}
            </li>)}
          {children[p].childrenCount > fiction.childrenIds.length && <Link
            className={cx('expand')}
            type='dashboard'
            action='more_chapters'
            data={{ pId: activeFiction.replace('fictions/', ''), cId: p.replace('fictions/', ''),
              offset: children[p].chapterIds.length }}
            name='SHOW MORE' />}
        </ul>) : <div>Empty!</div>}
        <Comments />
        <div className={cx('statistics')}>
          <div className={cx('title')}>Statistics <br /> (unique views)</div>
          <Link
            className={cx('header')}
            type='dashboard'
            action='stat_choose'
            data={{title: 'Choose a year', color: 'green', type: 'dashboard', action: 'stat_choose_confirm',
              data: { ids: Object.keys(statistics[fiction.statId].views).map(y => y !== 'uniques' && y !== 'complete' ? 
              y : null), type: 'activeYear', tab: 'monthly' }, list: Object.keys(statistics[fiction.statId].views)
                .map(y => y !== 'uniques'
              && y !== 'complete' ? y : null) }}
            name={`Choose year: ${activeYear ? activeYear : '-'}`} />
          <Link
            className={cx('header')}
            type='dashboard'
            action={activeYear ? 'stat_choose'  : 'no_year'}
            data={activeYear ? { title: 'Choose a month', color: 'green', type: 'dashboard',
              action: 'stat_choose_confirm', data: { ids: Object.keys(statistics[fiction.statId].views['2018'].months),
              type: 'activeMonth', tab: 'daily' },
              list: Object.keys(statistics[fiction.statId].views['2018'].months).map(m => months[m])} :
              { error: 'Select a year first!'}}
            name={`Choose month: ${activeMonth ? months[activeMonth] : '-'}`} />
          <div className={cx('header', { active: activeTab === 'yearly' })}>
            <Link
              className={cx('d-text')}
              type='dashboard'
              action='stat_tab'
              data={{ tab: 'yearly' }}
              name='Yearly' />
          </div>
          <div className={cx('header', { active: activeTab === 'monthly' })}>
            <Link
              className={cx('d-text')}
              type='dashboard'
              action='stat_tab'
              data={{ tab: 'monthly' }}
              name={'Monthly'} />
          </div>
          <div className={cx('header', { active: activeTab === 'weekly' })}>
            <Link
              className={cx('d-text')}
              type='dashboard'
              action='stat_tab'
              data={{ tab: 'weekly', year: activeYear ? activeYear : Object.keys(statistics[fiction.statId].views)[0] }}
              name='Weekly' />
          </div>
          <div className={cx('header', { active: activeTab === 'daily' })}>
            <Link
              className={cx('d-text')}
              type='dashboard'
              action='stat_tab'
              data={{ tab: 'daily', year: activeYear ? activeYear : Object.keys(statistics[fiction.statId].views)[0],
                month: activeMonth ? activeMonth : Object.keys(statistics[fiction.statId].views[activeYear ? activeYear :
                Object.keys(statistics[fiction.statId].views)[0]].months).slice(-1) }}
              name='Daily' />
          </div>
          <div className={cx('container', activeTab)}>
            {activeTab === 'daily' && <div className={cx('m')}>MON</div>}
            {activeTab === 'daily' && <div className={cx('m')}>TUE</div>}
            {activeTab === 'daily' && <div className={cx('m')}>WED</div>}
            {activeTab === 'daily' && <div className={cx('m')}>THU</div>}
            {activeTab === 'daily' && <div className={cx('m')}>FRI</div>}
            {activeTab === 'daily' && <div className={cx('m')}>SAT</div>}
            {activeTab === 'daily' && <div className={cx('m')}>SUN</div>}
            {activeTab === 'daily' ? viewsElements[activeTab][activeMonth].map(y => y) :
              viewsElements[activeTab].map(y => y)}        
            {activeTab === 'monthly' && <div className={cx('m')}></div>}
            {activeTab === 'monthly' && <div className={cx('m')}>JAN</div>}
            {activeTab === 'monthly' && <div className={cx('m')}>FEB</div>}
            {activeTab === 'monthly' && <div className={cx('m')}>MAR</div>}
            {activeTab === 'monthly' && <div className={cx('m')}>APR</div>}
            {activeTab === 'monthly' && <div className={cx('m')}>MAY</div>}
            {activeTab === 'monthly' && <div className={cx('m')}>JUN</div>}
            {activeTab === 'monthly' && <div className={cx('m')}>JUL</div>}
            {activeTab === 'monthly' && <div className={cx('m')}>AUG</div>}
            {activeTab === 'monthly' && <div className={cx('m')}>SEP</div>}
            {activeTab === 'monthly' && <div className={cx('m')}>OCT</div>}
            {activeTab === 'monthly' && <div className={cx('m')}>NOV</div>}
            {activeTab === 'monthly' && <div className={cx('m')}>DEC</div>}
          </div>
        </div>
      </div>
    );
  }
}

FictionDashboard.propTypes = {
  activeFiction: requiredIf(PropTypes.string, props => props.isFetching === 'dashboard_loaded'),
  chapters: PropTypes.object,
  children: requiredIf(PropTypes.object, props => props.isFetching === 'dashboard_loaded'),
  comments: requiredIf(PropTypes.object, props => props.isFetching === 'dashboard_loaded'),
  currentUser: requiredIf(PropTypes.string, props => props.isFetching === 'dashboard_loaded'),
  isFetching: PropTypes.string.isRequired,
  fiction: requiredIf(PropTypes.object, props => props.isFetching === 'dashboard_loaded'),
  showStats: requiredIf(PropTypes.string, props => props.isFetching === 'dashboard_loaded'),
  statInfo: requiredIf(PropTypes.object, props => props.isFetching === 'dashboard_loaded'),
  statistics: requiredIf(PropTypes.object, props => props.isFetching === 'dashboard_loaded'),
  users: requiredIf(PropTypes.object, props => props.isFetching === 'dashboard_loaded')
};

function mapStateToProps(state) {
  return state.fiction.isFetching !== 'dashboard_loaded' ? { isFetching: state.fiction.isFetching } : {
    activeFiction: state.fiction.activeFiction,
    chapters: state.fiction.chaptersById,
    children: state.fiction.childrenById,
    comments: state.comment.commentsById,
    currentUser: state.user.currentUser.id,
    isFetching: state.fiction.isFetching,
    fiction: state.fiction.fictionsById[state.fiction.activeFiction],
    showStats: state.statistics.showStats,
    statInfo: state.statistics.info,
    statistics: state.statistics.statisticsById,
    users: state.user.usersById
  };
}

export default connect(mapStateToProps, null)(FictionDashboard);