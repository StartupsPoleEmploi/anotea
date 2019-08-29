import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import MonComptePanel from './mon-compte/MonComptePanel';

export default class MonComptesRoutes extends React.Component {

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
    };

    render() {
        return (
            <div>
                <Route path="/mon-compte" component={MonComptePanel} />
            </div>
        );
    }
}
