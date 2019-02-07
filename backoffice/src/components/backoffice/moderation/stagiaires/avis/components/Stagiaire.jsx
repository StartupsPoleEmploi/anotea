import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import PrettyDate from '../../../../common/PrettyDate';
import { maskPseudo } from '../../../../../../lib/avisService';
import './Stagiaire.scss';

const Stars = ({ note }) => {
    return _.range(0, 5).map((v, index) => {
        return (
            <span
                key={index}
                className={`stars fa fa-star ${index > note && 'empty'}`}
            />
        );
    });
};
Stars.propTypes = { note: PropTypes.number.isRequired };

const Status = ({ avis }) => {

    if (!avis.comment) {
        return (<span />);
    }

    if (avis.published) {
        return (
            <span className="status published">
                (<span>Publié le </span>
                <PrettyDate date={new Date(avis.lastModerationAction)} />)
            </span>
        );
    } else if (avis.rejected) {
        return (
            <span className="status rejected">
                (<span>Rejeté le </span>
                <PrettyDate date={new Date(avis.lastModerationAction)} /> pour « <b>{avis.rejectReason}</b> »)
            </span>
        );
    } else if (!avis.moderated) {
        return (<span className="status toModerate">(&Agrave; modérer)</span>);
    }
    return (<span />);

};
Status.propTypes = { avis: PropTypes.object.isRequired };

export default class Stagiaire extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        showStatus: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string.isRequired,
    };

    toggle = async () => {
        let avis = this.props.avis;
        let updated = await maskPseudo(avis._id, !avis.pseudoMasked);
        this.props.onChange(updated);
    };

    render() {
        let avis = this.props.avis;

        return (
            <div className={`Stagiaire ${this.props.className}`}>

                <div className="mb-1">
                    <Stars note={avis.rates.global} />
                    <span className="by">par&nbsp;</span>
                    <span className={`pseudo mr-1 ${avis.pseudoMasked ? 'masked' : ''}`}>
                        {avis.pseudo ? avis.pseudo : 'anonyme'}
                    </span>

                    {avis.pseudo &&
                    <i className={`far ${avis.pseudoMasked ? 'fa-eye' : 'fa-eye-slash'} togglable mr-2`}
                       onClick={this.toggle} />
                    }
                </div>

                <div className="creation">
                    le <PrettyDate date={new Date(avis.date)} /> &nbsp;
                    {
                        this.props.showStatus &&
                        <Status avis={avis} />
                    }

                </div>
            </div>
        );
    }
}
