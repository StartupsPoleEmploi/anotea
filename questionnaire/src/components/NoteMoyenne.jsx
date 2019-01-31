import React, { Component } from 'react';

import Stars from './Stars';

import './NoteMoyenne.scss';

class NoteMoyenne extends Component {

    render() {
    return (
      <div>
        <div className="note odd">
          <span className="title">Note moyenne</span>
          <span className="description">Voici la moyenne des notes que vous avez données.</span>
          <span className="score">{this.props.averageScore}</span>
          <Stars />
        </div>
        <div className="note_details">
          <span className="note_details_title">Détails des notes</span>
          <span className="arrow"></span>
        </div>
      </div>
    );
  }
}

export default NoteMoyenne;
