import React, { Component } from 'react';
import PropTypes from 'prop-types';
import showdown from 'showdown';
import { sanitize } from '../utils/misc';

const converter = new showdown.Converter({
  strikethrough: true, tables: true, ghCodeBlocks: true, simpleLineBreaks: true
});


export default class TextBox extends Component {
  constructor(props) {
    super(props);
    this.sanitizeText = this.sanitizeText.bind(this);
  }

  sanitizeText(a) {
    return sanitize(a);
  }

  render() {
    const { className, value } = this.props;
    const text = Array.isArray(value) ? value.join(`
`) : value;

    return (
      <div className={className} dangerouslySetInnerHTML={{ __html: this.sanitizeText(converter.makeHtml(text)) }}></div>
    );
  }
}

TextBox.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string
  ]).isRequired
};