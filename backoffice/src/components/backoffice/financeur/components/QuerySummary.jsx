import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import './Badge.scss';
import Badge from './Badge';

const QuerySummary = ({ form, query }) => {

    let departement = form.departements.results.find(f => f.code === query.departement);
    let organisme = form.organismes.results.find(f => f.siren === query.siren);
    let formation = form.formations.results.find(f => f.idFormation === query.idFormation);
    let financeur = form.financeurs.results.find(f => f.code === query.codeFinanceur);
    let periode = `${query.startDate ? moment(parseInt(query.startDate)).format('DD/MM/YYYY') : ''}` +
        `${query.startDate && query.scheduledEndDate ? '-' : ''}` +
        `${query.scheduledEndDate ? moment(parseInt(query.scheduledEndDate)).format('DD/MM/YYYY') : ''}`;

    return (
        <div className="d-flex flex-wrap">
            {departement && <Badge color="green" text={departement.label} />}
            {organisme && <Badge color="green" text={organisme.name} />}
            {formation && <Badge color="green" text={formation.title} />}
            {financeur && <Badge color="green" text={financeur.label} />}
            {(query.startDate || query.scheduledEndDate) && <Badge color="green" text={periode} />}
        </div>
    );
};

QuerySummary.propTypes = {
    form: PropTypes.object.isRequired,
    query: PropTypes.object.isRequired,
};

export default QuerySummary;
