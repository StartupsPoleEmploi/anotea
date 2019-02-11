import React from 'react';
import PropTypes from 'prop-types';
import './Reponse.scss';
import PrettyDate from '../../../../common/PrettyDate';

const Status = ({ reponse }) => {

    switch (reponse.status) {
        case 'published':
            return (
                <span className="status published">
                    (<span>Publié le </span> <PrettyDate date={new Date(reponse.lastModerationAction)} />)
                </span>
            );
        case 'rejected':
            return (
                <span className="status rejected">
                    (<span>Rejeté le </span> <PrettyDate date={new Date(reponse.lastModerationAction)} />)
                </span>
            );
        default:
            return (<span />);
    }

};
Status.propTypes = { reponse: PropTypes.object.isRequired };

export default class Reponse extends React.Component {

    static propTypes = {
        reponse: PropTypes.object.isRequired,
    };

    render() {
        let reponse = this.props.reponse;

        return (
            <div className="Reponse">
                <div className="title">
                    <span>Réponse de l&apos;organisme </span>
                    <Status reponse={reponse} />
                    {reponse.date &&
                    <span className="date float-right">le <PrettyDate date={new Date(reponse.date)} /></span>
                    }
                </div>
                <p>{reponse.text}</p>
            </div>
        );
    }
}
