import React from 'react';
// import { exportOrganismes } from '../../moderateur/gestion/gestionOrganismesService';

import './ExportButton.scss';

export default class ExportButton extends React.Component {

    exportOrganismeInfoToExcel = () => {
        // exportOrganismes();
    };

    render() {
        return (
            <div className="Export">
                <button
                    type="button"
                    className="export-button"
                    onClick={this.exportOrganismeInfoToExcel}>
                    <i className="fas fa-download" />
                    &nbsp; EXPORTER
                </button>
            </div>
        );
    }
}
