import React from 'react';
import PropTypes from 'prop-types';
import './Reponse.scss';
import PrettyDate from '../PrettyDate';

const Status = ({ avis }) => {

    switch (avis.reponse.status) {
        case 'published':
            return (
                <span className="status published">
                    (<span>Publié le </span> <PrettyDate date={new Date(avis.reponse.lastStatusUpdate)} />)
                </span>
            );
        case 'rejected':
            return (
                <span className="status rejected">
                    (<span>Rejeté le </span> <PrettyDate date={new Date(avis.reponse.lastStatusUpdate)} />)
                </span>
            );
        default:
            return (<span />);
    }

};
Status.propTypes = { avis: PropTypes.object.isRequired };

export default class Reponse extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
    };

    render() {
        let { avis } = this.props;

        return (
            <div className="Reponse">
                <div className="title">
                    <span>Réponse de l&apos;organisme </span>
                    {avis.reponse.lastStatusUpdate &&
                    <Status avis={avis} />
                    }
                    {avis.reponse.date &&
                    <span className="date float-right">le <PrettyDate date={new Date(avis.reponse.date)} /></span>
                    }
                </div>
                <p>{avis.reponse.text}</p>
            </div>
        );
    }
}
