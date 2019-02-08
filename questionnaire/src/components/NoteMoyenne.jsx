import React, { Component } from 'react';

import PropTypes from 'prop-types';

import './NoteMoyenne.scss';

import AverageScore from './common/AverageScore';

class NoteMoyenne extends Component {

    static propTypes = {
        averageScore: PropTypes.number.isRequired
    }

    render() {
        return (
            <div className="note-moyenne">
                <div className="label">
                    <span className="title">Note moyenne</span>
                    <span className="description">Voici la moyenne des notes que vous avez données.</span>
                </div>
                <AverageScore score={this.props.averageScore} />
            </div>
        );
    }
}

export default NoteMoyenne;
