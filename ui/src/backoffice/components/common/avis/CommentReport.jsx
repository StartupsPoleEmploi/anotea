import React from 'react';
import PropTypes from 'prop-types';
import './Commentaire.scss';

export default class CommentReport extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
    };

    render() {
        let avis = this.props.avis;
        if (!avis.commentReport) {
            return ("");
        }

        return (
            <div>
                <div className="Titre">
                    <span className={`mr-1 title`}>Commentaire de signalement</span>
                </div>
                <span className="Commentaire">{avis.commentReport}</span>
            </div>
        );
    }
}
