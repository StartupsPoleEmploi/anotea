import React from 'react';
import PropTypes from 'prop-types';

export default function FiltersResume({ currentFinancer, currentOrganisation, currentDepartement, currentEntity, currentFormation }) {

    return (
        <div className="d-flex flex-wrap mr-auto p-2 bd-highlight filters-resume">
            {currentFinancer._id && <p>{currentFinancer.label}</p>}
            {currentOrganisation._id && <p>{currentOrganisation.label}</p>}
            {currentDepartement._id && <p>{currentDepartement.label}</p>}
            {currentEntity._id && <p>{currentEntity.label}</p>}
            {currentFormation._id && <p>{currentFormation.label}</p>}
        </div>
    );
}

FiltersResume.propTypes = {
    currentFinancer: PropTypes.object.isRequired,
    currentOrganisation: PropTypes.object.isRequired,
    currentDepartement: PropTypes.object.isRequired,
    currentEntity: PropTypes.object.isRequired,
    currentFormation: PropTypes.object.isRequired,
};
