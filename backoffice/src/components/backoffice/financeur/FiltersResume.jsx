import React from 'react';
import PropTypes from 'prop-types';

export default function FiltersResume({ currentFinancer, currentOrganisation, currentLieu, currentFormation }) {

    return (
        <div className="d-flex flex-wrap mr-auto p-2 bd-highlight filters-resume">
            {currentFinancer._id && <p>{currentFinancer.label}</p>}
            {currentOrganisation._id && <p>{currentOrganisation.label}</p>}
            {currentLieu._id && <p>{currentLieu.label}</p>}
            {currentFormation._id && <p>{currentFormation.label}</p>}
        </div>
    );
}

FiltersResume.propTypes = {
    currentFinancer: PropTypes.object.isRequired,
    currentOrganisation: PropTypes.object.isRequired,
    currentLieu: PropTypes.object.isRequired,
    currentFormation: PropTypes.object.isRequired,
};
