import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Score from './components/Score';
import WidgetContext from './WidgetContext';
import { NonNote } from './components/NonNote';


export default class ScoreWidget extends Component {

    static contextType = WidgetContext;

    static propTypes = {
        score: PropTypes.object.isRequired,
    };


    render() {
        let context = this.context;
        let { score } = this.props;

        if (score.nb_avis === 0) {
            if (context['show-if-0-reviews'] === 'true') {
                return <NonNote />;
            } else {
                return <div></div>;
            }
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
