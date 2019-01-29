import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './note.scss';

class Note extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
    };

    render() {
    return (
      <div>
        <span className="title">{this.props.title}</span>
        <span className="description">{this.props.description}</span>
      
        
      </div>
    );
  }
}

export default Note;
