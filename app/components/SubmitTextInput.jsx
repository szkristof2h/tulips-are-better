import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class SubmitTextInput extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    const { index, type, onEntryChange } = this.props;
    onEntryChange(e.target.value, index, type);
  }

  render() {
    const { className, placeholder, value } = this.props;
    return (
      <input
        className={className}
        placeholder={placeholder}
        onChange={this.onChange}
        value={value}
        autoFocus />
    );
  }
}

SubmitTextInput.propTypes = {
  className: PropTypes.string,
  index: PropTypes.number.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  onEntryChange: PropTypes.func
};
