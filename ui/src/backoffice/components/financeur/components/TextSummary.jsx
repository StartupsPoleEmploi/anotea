import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import './TextSummary.scss';
import FinanceurContext from '../FinanceurContext';

const TextSummary = ({ query }) => {

    let { store } = useContext(FinanceurContext);
    let { departements, formations } = store;

    let departement = departements && departements.find(f => f.code === query.departement);
    let formation = formations && formations.find(f => f.idFormation === query.idFormation);
    let debut = query.debut ? moment(parseInt(query.debut)).format('DD/MM/YYYY') : null;
    let fin = moment(query.fin ? parseInt(query.fin) : new Date()).format('DD/MM/YYYY');

    return (
        <div className="TextSummary d-flex justify-content-center align-items-center">
            <span>
                Formation échues {debut ? `entre le ${debut} et le ${fin}` : `jusqu'au ${fin}`}
            </span>
            <span>{departement ? departement.label : 'Tous les départements'}</span>
            <span>{formation ? formation.title : 'Toutes les formations'}</span>
        </div>
    );
};

TextSummary.propTypes = {
    query: PropTypes.object.isRequired,
};

export default TextSummary;
