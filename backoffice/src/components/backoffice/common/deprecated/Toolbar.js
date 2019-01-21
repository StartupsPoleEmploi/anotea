import React from 'react';
import PropTypes from 'prop-types';
import { getToken } from '../../../../utils/token';

export default class Toolbar extends React.PureComponent {

    static propTypes = {
        profile: PropTypes.string.isRequired,
        exportFilters: PropTypes.string
    };

    render() {
        const { profile } = this.props;
        return (
            <div className="toolbar">
                {
                    (profile === 'organisme' || profile === 'financer') &&
                    <div className="pull-left">
                        <a className="btn btn-success btn-sm"
                            href={`/api/backoffice/export/avis.csv?token=${getToken()}&${this.props.exportFilters !== undefined ? this.props.exportFilters : ''}`}>
                            <span className="fas fa-file-export" /> Exporter vers Excel
                        </a>
                    </div>
                }
            </div>
        );
    }
}
