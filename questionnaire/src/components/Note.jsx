import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Stars from './Stars';

import './note.scss';

class Note extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        parity: PropTypes.string.isRequired
    };

    render() {
    return (
      <div className={`note ${this.props.parity}`}>
        <span className="title">{this.props.title}</span>
        <span className="description">{this.props.description}</span>
        <Stars />
      </div>
    );
  }
}

export default Note;
