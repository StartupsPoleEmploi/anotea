import React from 'react';
import PropTypes from 'prop-types';

export default function Titre({ avis }) {

    if (!avis.comment || !avis.comment.title) {
        return <div className="Titre empty">Aucun titre</div>;
    }
    return (
        <div className="Titre">
            <span className={`mr-1 title ${avis.titleMasked ? 'masked' : ''}`}>{avis.comment.title}</span>
        </div>
    );
}

Titre.propTypes = {
    avis: PropTypes.object.isRequired,
};
