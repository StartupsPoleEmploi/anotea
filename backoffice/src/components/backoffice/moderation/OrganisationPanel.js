import React from 'react';
import PropTypes from 'prop-types';

import { getOrganisationInfo } from '../../../lib/organisationService';

import OrganisationDetail from './OrganisationDetail';

export default class OrganisationPanel extends React.PureComponent {

    state = {
        siret: '',
        organisation: undefined
    }

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
    }

    doSearch = () => {
        getOrganisationInfo(this.state.siret).then(organisation => {
            this.setState({ organisation: organisation });
        }).catch(() => {
            this.setState({ organisation: null });
        });
    }

    updateSIRET = event => {
        this.setState({ siret: event.target.value });
    }

    render() {
        return (
            <div className="organisationPanel">
                <h1>Gestion des organismes</h1>
                <input type="text" placeholder="SIRET" value={this.state.siret} onChange={this.updateSIRET} /> <button className="btn btn-primary" onClick={this.doSearch}><i className="glyphicon glyphicon-search"></i> Chercher</button>

                <OrganisationDetail organisation={this.state.organisation} refresh={this.doSearch} />
            </div>
        );
    }
}
