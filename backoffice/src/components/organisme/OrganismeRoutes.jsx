import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import MonComptePage from '../misc/MonComptePage';
import OrganismePage from './OrganismePage';

export default class OrganismeRoutes extends React.Component {

    static propTypes = {
        navigator: PropTypes.object.isRequired,
    };

    render() {
        let { navigator } = this.props;
        return (
            <>
                <Route
                    path={'/admin/organisme/avis'}
                    render={() => <OrganismePage navigator={navigator} />}
                />
                <Route
                    path={'/admin/organisme/mon-compte'}
                    component={MonComptePage}
                />
            </>
        );
    }
}
