import React from 'react';
import PropTypes from 'prop-types';
import { getToken } from '../../../../../utils/token';

export default class DeprecatResume extends React.PureComponent {

    static propTypes = {
        exportFilters: PropTypes.string,
        inventory: PropTypes.number.isRequired,
        advices: PropTypes.array.isRequired
    };

    getUrl = () => {
        const publicUrl = process.env.PUBLIC_URL ? '' : 'http://localhost:8080';
        let filters = this.props.exportFilters !== undefined ? this.props.exportFilters : '';
        let params = filters ? `${filters}&token=${getToken()}` : `?token=${getToken()}`;

        return `${publicUrl}/api/backoffice/export/avis.csv${params}`;
    };

    render() {
        return (
            <React.Fragment>
                <p className="title bd-highlight">{this.props.advices.length} avis affichés sur {this.props.inventory}</p>
                <a className="btn export-button btn-sm bd-highlight" href={this.getUrl()}>
                    <span className="fas fa-download" /> EXPORTER
                </a>
            </React.Fragment>
        );
    }
}
