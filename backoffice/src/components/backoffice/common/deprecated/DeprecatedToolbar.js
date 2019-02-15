import React from 'react';
import PropTypes from 'prop-types';
import { getToken } from '../../../../utils/token';

export default class DeprecatedToolbar extends React.PureComponent {

    static propTypes = {
        profile: PropTypes.string.isRequired,
        exportFilters: PropTypes.string
    };

    getUrl = () => {
        const publicUrl = process.env.PUBLIC_URL ? '' : 'http://localhost:8080';
        let filters = this.props.exportFilters !== undefined ? this.props.exportFilters : '';
        let params = filters ? `${filters}&token=${getToken()}` : `?token=${getToken()}`;

        return `${publicUrl}/api/backoffice/export/avis.csv${params}`;
    };

    render() {
        const { profile } = this.props;
        return (
            <div className="toolbar">
                {
                    (profile === 'organisme' || profile === 'financeur') &&
                    <div className="pull-left">
                        <a className="btn btn-success btn-sm" href={this.getUrl()}>
                            <span className="fas fa-file-export" /> Exporter vers Excel
                        </a>
                    </div>
                }
            </div>
        );
    }
}
