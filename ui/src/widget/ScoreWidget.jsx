import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Score from './components/Score';

export default class ScoreWidget extends Component {

    static propTypes = {
        score: PropTypes.object.isRequired,
    };

    render() {
        let { score } = this.props;

        if (score.nb_avis === 0) {
            return <div></div>;
        }

        return (
            <div className="ScoreWidget">
                <div className="row my-3">
                    <div className="col-12">
                        <Score score={score} />
                    </div>
                </div>
            </div>
        );
    }
}
