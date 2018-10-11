import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { dismissMessage } from '../actions/messages';
import { typing } from '../actions/editor';
import styles from '../css/components/popup';
import Link from '../components/Link';

import checkbox_w40 from "../images/checkbox_w40.png";
import tick_w40 from "../images/tick_w40.png";

const cx = classNames.bind(styles);

class Popup extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }
  
  onChange(e) {
    const { typing } = this.props;
    typing(e.target.value, 0, 'popup');
  }

  render() {
    const { input, status, type } = this.props;
    const color = status.color ? status.color : '';
    const list = status.list ? status.list : null;
    return (
    <div
      className={cx('message', color, type,
        {show: Object.keys(status).length != 0}
      )}
      style={{width: status.width, margin: `0 ${(720-status.width)/2}px`}} // using inline because of the variable width
      onClick={dismissMessage}>
      <div className={cx('header')}>
        {status.title}
      </div>
        {list && <div className={cx('list')}>
        {list.map((l, i) =>
          l && <Link
            key={`pL${l}${i}`}
            className={cx('header')}
            type={status.type}
            action={status.action}
            data={ status.action === 'confirm_report' ? 
              { id: status.id, reason: status.data.reason[i], type: status.data.type[i] } :
              { ...{ id: status.data.ids[i] }, ...status.data }}
            name={l} />) 
        }
        </div>}
        {type === 'addAuthor' && <div className={cx('add-author')}>
          <div className={cx('info')}>
            Copy the numbers at the end of a profile url (as shown below) to get the user ID.
          </div>
          <div className={cx('info')}>
            ex: http://tulipsarebetter.com/user/Sora/<strong>548986</strong>/
          </div>
          <div className={cx('label')}>User ID</div>
          <input type="text" onChange={this.onChange} className={cx('input')} />
          <div className={cx('label')}>Positions</div>
          <div className={cx('placeholder')}></div>
          <Link
            className={cx('container')}
            type='editor'
            action='choose_position'
            data={{ position: 'main-author' }}
            name=''>
            <div className={cx('d-text')}>Main Author</div>
            <img className={cx('icon')} alt="" title="" src={input.positions.includes('main-author') ? tick_w40 : 
              checkbox_w40} />
          </Link>
          <Link
            className={cx('container')}
            type='editor'
            action='choose_position'
            data={{ position: 'co-author' }}
            name=''>
            <div className={cx('d-text')}>Co-Author</div>
            <img className={cx('icon')} alt="" title="" src={input.positions.includes('co-author') ? tick_w40 : 
              checkbox_w40} />
          </Link>
          <Link
            className={cx('container')}
            type='editor'
            action='choose_position'
            data={{ position: 'editor' }}
            name=''>
            <div className={cx('d-text')}>Editor</div>
            <img className={cx('icon')} alt="" title="" src={input.positions.includes('editor') ? tick_w40 : 
              checkbox_w40} />
          </Link>
          <div className={cx('placeholder')}></div>
          <div className={cx('placeholder')}></div>
          <Link
            className={cx('container')}
            type='editor'
            action='choose_position'
            data={{ position: 'proofreader' }}
            name=''>
            <div className={cx('d-text')}>Proofreader</div>
            <img className={cx('icon')} alt="" title="" src={input.positions.includes('proofreader') ? tick_w40 : 
              checkbox_w40} />
          </Link >
          <Link
            className={cx('container')}
            type='editor'
            action='choose_position'
            data={{ position: 'betareader' }}
            name=''>
            <div className={cx('d-text')}>Betareader</div>
            <img className={cx('icon')} alt="" title="" src={input.positions.includes('betareader') ? tick_w40 : 
              checkbox_w40} />
          </Link>
          <Link
            className={cx('container')}
            type='editor'
            action='choose_position'
            data={{ position: 'other' }}
            name=''>
            <div className={cx('d-text')}>Other</div>
            <img className={cx('icon')} alt="" title="" src={input.positions.includes('other') ? tick_w40 : 
              checkbox_w40} />
          </Link>
          <div className={cx('placeholder')}></div>
          <Link
            className={cx('button')}
            type='editor'
            action={input.positions.length == 0 || input.author === '' ? 'no_position' : 'add_author'}
            data={input.author === '' ? { error: 'You didn\'t add an author' } : 
              Object.keys(input.positions).length == 0 ? { error: 'Add at least 1 position to the author!' } :
              { id: input.author, positions: input.positions }
            }
            name='Add author' />
        </div>}
        {type === 'rating' &&
          <div className={cx('add-rating')}>
          {['overall', 1, 'style', 2, 'grammar', 3, 'story', 4, 'characters'].map((t, i) =>
            typeof t == 'string' ?
              <div className={cx('container')} key={`pR${t}${i}`}>
                <div className={cx('d-text')}>{t.toUpperCase()}</div>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => <Link
                  key={`pRV${t}${r}`}
                  className={cx('d-num', { active: status.ratings[status.types.indexOf(t)] == r })}
                  type='popup'
                  action='review_rating'
                  data={{ rating: r, index: status.types.indexOf(t) }}
                  name={r + ''} />)}
              </div>
            : '')}
            </div>
        }
        {type === 'rating' &&
          <Link
            className={cx('submit-button')}
            type='fiction'
            action={`confirm_${status.hasReview ? 'edit_' : ''}rate`}
            data={{ id: status.id, parentId: status.parentId, ratings: status.ratings, rating: true }}
            name='Submit' />
        }
        <Link
          className={cx('button', type)}
          type='popup'
          action='close'
          data={{}}
          name='Cancel' />
    
    </div>
    );
  }
};

Popup.propTypes = {
  input: PropTypes.object,
  dismissMessage: PropTypes.func.isRequired,
  status: PropTypes.object,
  type: PropTypes.string,
  typing: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    input: state.popup.input,
    status: state.popup.status,
    type: state.popup.type
  };
}

export default connect(mapStateToProps, { dismissMessage, typing })(Popup);
