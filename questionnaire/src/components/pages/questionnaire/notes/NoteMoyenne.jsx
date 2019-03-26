import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AverageScore from './AverageScore';
import './NoteMoyenne.scss';

class NoteMoyenne extends Component {

    static propTypes = {
        averageScore: PropTypes.number.isRequired
    };

    render() {
        return (
            <div className="note-moyenne">
                <div className={`row inner-row align-items-center`}>
                    <div className="col-sm-7">
                        <div className="label">
                            <span className="title">Note moyenne</span>
                            <span className="description">Voici la moyenne des notes que vous avez données.</span>
                        </div>
                    </div>
                    <div className="col-sm-5">
                        <AverageScore score={this.props.averageScore} />
                    </div>
                </div>
            </div>
        );
    }
}

export default NoteMoyenne;
