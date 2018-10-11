import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Link from '../components/Link';
import classNames from 'classnames/bind';
import styles from '../css/components/schedule';
import SubmitTextInput from '../components/SubmitTextInput';

const cx = classNames.bind(styles);

export default class Schedule extends Component {
  render() {
    const { schedule, scheduleType, type, typing } = this.props;

    return (
      <div className={cx('schedule', { fiction: type === 'normal'})}>
        {type === 'normal' ?
          <div className={cx('day', 'schedule-time')}>{scheduleType}</div>
        : <Link
            className={cx('day', 'schedule-time', 'editable', { long: scheduleType === 'bi-weekly' })}
            type='editor'
            action='schedule_type'
            data={{}}
            name={scheduleType} />}
        {type === 'normal' ? <div className={cx('day-m', 'schedule-time')}>{scheduleType}</div> :
          <Link
            className={cx('day-m', 'schedule-time', 'editable', { long: scheduleType === 'bi-weekly' })}
            type='editor'
            action='schedule_type'
            data={{}}
            name={scheduleType} />
      }
        <div className={cx('day')}>MON</div>
        <div className={cx('day-m')}>M</div>
        <div className={cx('day')}>TUE</div>
        <div className={cx('day-m')}>T</div>
        <div className={cx('day')}>WED</div>
        <div className={cx('day-m')}>W</div>
        <div className={cx('day')}>THU</div>
        <div className={cx('day-m')}>T</div>
        <div className={cx('day')}>FRI</div>
        <div className={cx('day-m')}>F</div>
        <div className={cx('day')}>SAT</div>
        <div className={cx('day-m')}>S</div>
        <div className={cx('day')}>SUN</div>
        <div className={cx('day-m')}>S</div>
        <div className={cx('chapter')}>Regular</div>
        {schedule.map((s, i) =>
          type === 'normal' ? <div key={('rD' + i)} className={cx('chapter')}>{s[0] === 0 ? '-' : s[0]}</div> :
            <SubmitTextInput
            key={('r' + i)}
            className={cx('edit')}
            index={i*2}
            type='editor-schedule' 
            value={s[0] ? s[0] : ''}
            onEntryChange={typing} />
        )}
        <div className={cx('chapter')}>Sponsored</div>
        {schedule.map((s, i) =>
          type === 'normal' ? <div key={('sD' + i)} className={cx('chapter')}>{s[1] === 0 ? '-' : s[1]}</div> :
            <SubmitTextInput
            key={('r' + i)}
            className={cx('edit')}
            index={i*2+1}
            type='editor-schedule'
            value={s[1] ? s[1] : ''}
            onEntryChange={typing} />
        )}
      </div>
    );
  }
}

Schedule.propTypes = {
  schedule: PropTypes.array.isRequired,
  scheduleType: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired
};