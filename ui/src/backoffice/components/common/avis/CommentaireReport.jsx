import React from 'react';
import PropTypes from 'prop-types';
import './Commentaire.scss';

export default class CommentaireReport extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
    };

    render() {
        let avis = this.props.avis;
        if (!avis.commentaireReport) {
            return ("");
        }

        return (
            <div>
                <div className="Titre">
                    <span className={`mr-1 title`}>Commentaire de signalement</span>
                </div>
                <span className="Commentaire">{avis.commentaireReport}</span>
            </div>
        );
    }
}
