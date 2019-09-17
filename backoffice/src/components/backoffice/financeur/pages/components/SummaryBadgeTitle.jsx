import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import './SummaryBadgeTitle.scss';

const truncate = (input, max) => input.length > max ? `${input.substring(0, max)}...` : input;

const Badge = props => {

    let className = `${props.className || ''}`;
    let color = `${props.color || ''}`;
    let maxLength = props.ellipsis || 20;
    let showTooltip = props.text.length > maxLength;

    return (
        <div className={`Badge ${className} ${color} ${showTooltip ? 'with-pointer' : ''}`}>
            {truncate(props.text, maxLength)}
            {showTooltip && <span className="badge-tooltip">{props.text}</span>}
        </div>
    );
};

Badge.propTypes = {
    text: PropTypes.string.isRequired,
    className: PropTypes.string,
    color: PropTypes.string,
    ellipsis: PropTypes.number,
};

const SummaryBadgeTitle = ({ form, query, ellipsis }) => {

    let { departements, organismes, formations, financeurs } = form;

    let departement = departements && departements.results.find(f => f.code === query.departement);
    let organisme = organismes && organismes.results.find(f => f.siren === query.siren);
    let formation = formations && formations.results.find(f => f.idFormation === query.idFormation);
    let financeur = financeurs && financeurs.results.find(f => f.code === query.codeFinanceur);
    let periode = `${query.startDate ? moment(parseInt(query.startDate)).format('DD/MM/YYYY') : ''}` +
        `${query.startDate && query.scheduledEndDate ? '-' : ''}` +
        `${query.scheduledEndDate ? moment(parseInt(query.scheduledEndDate)).format('DD/MM/YYYY') : ''}`;

    return (
        <div className="d-flex flex-wrap">
            {departement && <Badge ellipsis={ellipsis} color="green" text={departement.label} />}
            {organisme && <Badge ellipsis={ellipsis} color="green" text={organisme.name} />}
            {formation && <Badge ellipsis={ellipsis} color="green" text={formation.title} />}
            {financeur && <Badge ellipsis={ellipsis} color="green" text={financeur.label} />}
            {(query.startDate || query.scheduledEndDate) && <Badge color="green" text={periode} />}
        </div>
    );
};

SummaryBadgeTitle.propTypes = {
    query: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    ellipsis: PropTypes.number,
};

export default SummaryBadgeTitle;
