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
            <div className={`Titre ${avis.commentaire.titleMasked ? 'masked' : ''}`}>
                
                {showModerationButtons && (
                    <>
                        <span className={`sr-only ${avis.commentaire.titleMasked ? '' : 'titre-masque'}`}>titre masqué</span>
                        <h3 className={`mr-1 title span-title ${avis.commentaire.titleMasked ? 'masked' : ''}`}>{avis.commentaire.title}</h3>
                        <button type="button" className="button-eye" onClick={this.toggle}>
                            <span className="sr-only">{avis.commentaire.titleMasked ? "Afficher le titre" : "Masquer le titre"}</span>
                            <i className={`far sr ${avis.commentaire.titleMasked ? 'fa-eye' : 'fa-eye-slash'} toggable`} />
                        </button>
                    </>
                )}
            </div>
        );
    }
}
