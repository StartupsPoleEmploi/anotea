import React from 'react';
import PropTypes from 'prop-types';

import './Export.scss';

export default class Export extends React.Component {

  exportOrganismeInfoToExcel = () => {
      console.log('kiki');
  };

    render() {
        return (
            <div className="Export">
                <button
                    type="button"
                    className="export-button"
                    onClick={this.exportOrganismeInfoToExcel}>
                    <i className="fas fa-file-export" />
                    &nbsp; EXPORTER
                </button>
            </div>
        );
    }
}
