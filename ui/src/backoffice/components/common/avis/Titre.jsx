import React from 'react';
import PropTypes from 'prop-types';
import { maskTitle } from '../../../services/avisService';
import './Titre.scss';

export default class Titre extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        showModerationButtons: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    };


    toggle = async () => {
        let avis = this.props.avis;
        let updated = await maskTitle(avis._id, !avis.commentaire.titleMasked);
        this.props.onChange(updated);
    };

    render() {
        let { avis, showModerationButtons } = this.props;

        if (!avis.commentaire || !avis.commentaire.title) {
            return <div className="Titre empty">Aucun titre</div>;
        }
        return (
            <div className="Titre">
                <span className={`mr-1 title ${avis.commentaire.titleMasked ? 'masked' : ''}`}>{avis.commentaire.title}</span>
                {showModerationButtons &&
                <i className={`far ${avis.commentaire.titleMasked ? 'fa-eye' : 'fa-eye-slash'} toggable`} onClick={this.toggle} />
                }
            </div>
        );
    }
}
