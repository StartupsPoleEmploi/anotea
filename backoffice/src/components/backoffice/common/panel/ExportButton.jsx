import React from 'react';
import { exportOrganismes } from '../../moderateur/gestion/gestionOrganismesService';

import './ExportButton.scss';

export default class ExportButton extends React.Component {

    exportOrganismeInfoToExcel = async () => {
        const organismes = await exportOrganismes(this.props.status);
        let lines = 'Siret;Nom;Email;Nombre d\'avis\n';

        organismes.forEach(organisme => {
            lines += organisme._id + ';' +
               organisme.raisonSociale + ';' +
               organisme.courriel + ';' +
               organisme.score.nb_avis + '\n';
        });

        const hiddenElement = document.createElement('a');
        let csvData = new Blob([lines], { type: 'text/csv;charset=utf-8' });

        hiddenElement.href = URL.createObjectURL(csvData);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'organismes.csv';
        hiddenElement.click();
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
