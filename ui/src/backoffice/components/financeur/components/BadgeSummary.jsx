import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import './BadgeSummary.scss';
import FinanceurContext from '../FinanceurContext';

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

const BadgeSummary = ({ query, ellipsis }) => {

    let { store } = useContext(FinanceurContext);
    let { departements, sirens, formations, financeurs } = store;

    let departement = departements && departements.find(f => f.code === query.departement);
    let siren = sirens && sirens.find(f => f.siren === query.siren);
    let formation = formations && formations.find(f => f.numeroFormation === query.numeroFormation);
    let financeur = financeurs && financeurs.find(f => f.code === query.codeFinanceur);
    let periode = `${query.debut ? moment(parseInt(query.debut)).format('DD/MM/YYYY') : ''}` +
        `${query.debut && query.fin ? '-' : ''}` +
        `${query.fin ? moment(parseInt(query.fin)).format('DD/MM/YYYY') : ''}`;

    return (
        <div className="d-flex flex-wrap">
            {departement && <Badge ellipsis={ellipsis} color="green" text={departement.label} />}
            {siren && <Badge ellipsis={ellipsis} color="green" text={siren.name} />}
            {formation && <Badge ellipsis={ellipsis} color="green" text={formation.title} />}
            {financeur && <Badge ellipsis={ellipsis} color="green" text={financeur.label} />}
            {(query.debut || query.fin) && <Badge ellipsis={ellipsis} color="green" text={periode} />}
        </div>
    );
};

BadgeSummary.propTypes = {
    query: PropTypes.object.isRequired,
    ellipsis: PropTypes.number,
};

export default BadgeSummary;
