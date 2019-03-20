import React from 'react';
import { getToken } from '../../../../utils/token';

import './ExportButton.scss';

export default class ExportButton extends React.Component {

    getUrl = () => {
        const publicUrl = process.env.PUBLIC_URL ? '' : 'http://localhost:8080';
        let filters = this.props.status !== undefined ? this.props.status : '';
        let params = filters ? `?status=${filters}&token=${getToken()}` : `?token=${getToken()}`;

        return `${publicUrl}/api/backoffice/moderateur/export/organismes.csv${params}`;
    };

    render() {
        return (
            <div className="Export">
                <a className="btn export-button btn-sm" href={this.getUrl()}>
                    <span className="fas fa-file-export" /> Exporter vers Excel
                </a>
            </div>
        );
    }
}
