import React, { Component } from 'react';

import Stars from './Stars';

import './NoteMoyenne.scss';

class NoteMoyenne extends Component {

    render() {
    return (
      <div className="note odd">
        <span className="title">Note moyenne</span>
        <span className="description">Voici la moyenne des notes que vous avez données.</span>
        <span className="score">{this.props.averageScore}</span>
        <Stars />
      </div>
    );
  }
}

export default NoteMoyenne;
