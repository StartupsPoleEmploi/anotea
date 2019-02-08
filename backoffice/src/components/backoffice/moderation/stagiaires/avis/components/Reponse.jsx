import React from 'react';
import PropTypes from 'prop-types';
import './Reponse.scss';

export default class Reponse extends React.Component {

    static propTypes = {
        reponse: PropTypes.object.isRequired,
    };

    render() {
        let reponse = this.props.reponse;

        return (
            <div className="Reponse">
                <div className="title">Réponse de l&apos;organisme</div>
                <p>{reponse.text}</p>
            </div>
        );
    }
}
