import React from 'react';
import PropTypes from 'prop-types';
import './Reponse.scss';
import PrettyDate from '../../../../common/PrettyDate';

export default class Reponse extends React.Component {

    static propTypes = {
        reponse: PropTypes.object.isRequired,
    };

    render() {
        let reponse = this.props.reponse;

        return (
            <div className="Reponse">
                <div>
                    <span className="title">Réponse de l&apos;organisme</span>
                    {reponse.date &&
                    <span className="date float-right"><PrettyDate date={new Date(reponse.date)} /></span>
                    }
                </div>
                <p>{reponse.text}</p>
            </div>
        );
    }
}
