import React from 'react';
import PropTypes from 'prop-types';
import './Organisme.scss';
import PrettyDate from '../../../../common/PrettyDate';

export default class Organisme extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
    };

    render() {
        let avis = this.props.avis;
        return (
            <div className="Organisme">
                <p className="name">{avis.training.organisation.name}</p>
                <p>
                    <span>{avis.training.title}</span><br />
                    <span>
                    {avis.training.place.city}
                        &nbsp;du <PrettyDate date={new Date(avis.training.startDate)} short={true} />
                        &nbsp;au <PrettyDate date={new Date(avis.training.scheduledEndDate)} short={true} />
                </span>
                </p>
            </div>
        );
    }
}
