import React from 'react';
import PropTypes from 'prop-types';
import PrettyDate from '../../common/PrettyDate';

export default function FiltersResume({ startDate, endDate, currentFinancer, currentOrganisation, currentLieu, currentFormation }) {

    return (
        <div className="d-flex flex-wrap mr-auto p-2 bd-highlight filters-resume">
            {endDate && <p><PrettyDate date={new Date(startDate)} /> à <PrettyDate date={new Date(endDate)} /></p>}
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
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
};
