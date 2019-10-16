import React from 'react';
import PropTypes from 'prop-types';
import './Commentaire.scss';

export default class Commentaire extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
    };

    render() {
        let avis = this.props.avis;
        if (!avis.comment || !avis.comment.text) {
            return (
                <span className="Commentaire empty">Le stagiaire n&apos;a pas souhaité laisser de commentaire</span>);
        }

        return (
            <span className="Commentaire">{avis.comment.text}</span>);
    }
}
