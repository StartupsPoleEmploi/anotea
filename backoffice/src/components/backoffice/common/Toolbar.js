import React from 'react';
import PropTypes from 'prop-types';

export default class Toolbar extends React.PureComponent {

    static propTypes = {
        profile: PropTypes.string.isRequired
    };

    render() {
        const { profile } = this.props;
        return (
            <div className="toolbar">
                {
                    (profile === 'organisme' || profile === 'financer') &&
                    <div className="pull-left">
                        <a className="btn btn-success btn-sm"
                            href={`/api/avis.csv`}>
                            <span className="fas fa-file-export" /> Exporter vers Excel
                        </a>
                    </div>
                }
            </div>
        );
    }
}
