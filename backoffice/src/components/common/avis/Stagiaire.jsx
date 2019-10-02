import React from 'react';
import PropTypes from 'prop-types';
import PrettyDate from '../PrettyDate';
import { maskPseudo } from '../../../services/avisService';
import './Stagiaire.scss';

const Stars = props => {

    let isDecimalsNumber = props.note % 1 !== 0;
    let note = Math.round(props.note);
    let stars = new Array(5).fill('active', 0, note).fill('empty', note, 5);

    return (
        <span>
            {
                stars.map((star, index) => {
                    let starClass = (isDecimalsNumber && Math.ceil(note) === index + 1 && index <= note) ? 'fa-star-half-alt' : 'fa-star';
                    return <span
                        key={index}
                        className={star === 'active' ? `stars fa ${starClass} active` : 'stars fa fa-star empty'}
                    />;
                })
            }
        </span>
    );
};
Stars.propTypes = { note: PropTypes.number.isRequired };

const Status = ({ avis }) => {

    if (avis.archived) {
        return (<span className="status">(Archivé)</span>);
    } else if (avis.reported) {
        return (
            <span className="status reported">
                (<span>Signalé le </span>
                <PrettyDate date={new Date(avis.lastStatusUpdate)} />)
            </span>
        );
    } else if (avis.published) {
        return (
            <span className="status published">
                (<span>Publié le </span>
                <PrettyDate date={new Date(avis.lastStatusUpdate)} />)
            </span>
        );
    } else if (avis.rejected) {
        return (
            <span className="status rejected">
                (<span>Rejeté le </span>
                <PrettyDate date={new Date(avis.lastStatusUpdate)} /> pour « <b>{avis.rejectReason}</b> »)
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
        showModerationButtons: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    };

    toggle = async () => {
        let avis = this.props.avis;
        let updated = await maskPseudo(avis._id, !avis.pseudoMasked);
        this.props.onChange(updated);
    };

    render() {
        let { avis, showModerationButtons, showStatus } = this.props;

        return (
            <div className="Stagiaire">
                <div>
                    <Stars note={avis.rates.global} />
                    <span className="by">par&nbsp;</span>
                    <span className={`pseudo mr-1 ${avis.pseudoMasked ? 'masked' : ''}`}>
                        {avis.pseudo ? avis.pseudo : 'anonyme'}
                    </span>

                    {showModerationButtons && avis.pseudo &&
                    <i className={`far ${avis.pseudoMasked ? 'fa-eye' : 'fa-eye-slash'} togglable mr-2`}
                       onClick={this.toggle} />
                    }
                </div>

                <div className="date">
                    le <PrettyDate date={new Date(avis.date)} /> &nbsp;
                    {showStatus &&
                    <Status avis={avis} />
                    }
                </div>
            </div>
        );
    }
}
