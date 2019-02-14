import React from 'react';
import PropTypes from 'prop-types';
import './Reponse.scss';
import PrettyDate from '../../../../common/PrettyDate';

const Status = ({ avis }) => {

    switch (avis.answer.status) {
        case 'published':
            return (
                <span className="status published">
                    (<span>Publié le </span> <PrettyDate date={new Date(avis.answer.lastModerationAction)} />)
                </span>
            );
        case 'rejected':
            return (
                <span className="status rejected">
                    (<span>Rejeté le </span> <PrettyDate date={new Date(avis.answer.lastModerationAction)} />)
                </span>
            );
        default:
            return (<span />);
    }

};
Status.propTypes = { reponse: PropTypes.object.isRequired };

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
                    {avis.answer.lastModerationAction &&
                    <Status avis={avis} />
                    }
                    {avis.answer.date &&
                    <span className="date float-right">le <PrettyDate date={new Date(avis.answer.date)} /></span>
                    }
                </div>
                <p>{avis.answer.text}</p>
            </div>
        );
    }
}
