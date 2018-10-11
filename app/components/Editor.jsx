import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Link from '../components/Link';
import classNames from 'classnames/bind';
import styles from '../css/components/editor';

import TextBox from '../components/TextBox';
import TurndownService from 'turndown';
const turndownPluginGfm = require('turndown-plugin-gfm');
import { sanitize } from '../utils/misc';

import checkbox_w40 from "../images/checkbox_w40.png";
import preview_w40 from "../images/editor/preview_w40.png";
import n_preview_w40 from "../images/editor/n_preview_w40.png";
import tick_w40 from "../images/tick_w40.png";

const cx = classNames.bind(styles);

export default class Editor extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onPaste = this.onPaste.bind(this);
    this.sanitizePasted = this.sanitizePasted.bind(this);
    this.tAreaRef = React.createRef();
  }

  sanitizePasted(a) {
    return sanitize(a);
  }

  onChange(e) {
    const { index, isPasting, pasting, typing } = this.props;
    if (!isPasting) typing(e.target.value, index, 'editor');
    pasting(false);
  }

  onPaste(e) {
    const gfm = turndownPluginGfm.gfm;
    const turndownService = new TurndownService();
    const tables = turndownPluginGfm.tables;
    const strikethrough = turndownPluginGfm.strikethrough;
    turndownService.use(gfm);
    turndownService.use([tables, strikethrough]);
    const { index, formatting, pasting, typing, value } = this.props;
    const pastedText = formatting && e.clipboardData.getData('text/html') !== '' ? turndownService.
      turndown(this.sanitizePasted(e.clipboardData.getData('text/html'))) : e.clipboardData.getData('Text');
    const text = pastedText;
    const element = this.tAreaRef.current;
    const start = element.selectionStart;
    const end = element.selectionEnd;

    typing(`${value.slice(0, start)}${text}${start == end ? value.slice(start) :
      value.slice(end)}`, index, 'editor');
    pasting(true);
  }

  render() {
    const { focus, formatting, hide, index, placeholder, preview, type, value } = this.props;

    return (
      <div className={cx('editor')}>
        {!hide ? <div className={cx('buttons')}>
          <Link
            className={cx('button')}
            type='editor'
            action='preview'
            data={{ index }}
            name=''>
            <img className={cx('icon')} alt="" title="" src={preview ? preview_w40 : n_preview_w40} />
            <div className={cx('b-text')}>PREVIEW</div>
          </Link>
          <Link
            className={cx('button')}
            type='editor'
            action='formatting'
            data={{ index }}
            name=''>
            <img className={cx('icon')} alt="" title="" src={formatting ? tick_w40 : checkbox_w40} />
            <div className={cx('b-text')}>KEEP FORMATTING</div>
          </Link>
          <Link
            className={cx('button')}
            type='editor'
            action='markdown'
            data={{}}
            name=''>
            <div className={cx('b-text')}>MARKDOWN CHEATSHEET</div>
          </Link>
        </div> : ''}
        {preview ? 
          <TextBox className={cx('text', type)} value={value} /> :
          <textarea
            className={cx('body', type)}
            ref={this.tAreaRef} 
            placeholder={placeholder}
            onChange={this.onChange}
            onPaste={this.onPaste}
            value={value} />}
      </div>
    );
  }
}

Editor.propTypes = {
  formatting: PropTypes.bool.isRequired,
  focus: PropTypes.bool,
  hide: PropTypes.bool,
  index: PropTypes.number.isRequired,
  isPasting: PropTypes.bool.isRequired,
  pasting: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  preview: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  typing: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired
};