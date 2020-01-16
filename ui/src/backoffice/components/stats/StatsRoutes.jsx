import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import StatsPage from '../stats/StatsPage';

export default class StatsRoutes extends React.Component {

    static propTypes = {
        router: PropTypes.object.isRequired,
    };

    render() {
        let { router } = this.props;

        return (
            <>
                <Route path="/admin/stats" render={() => <StatsPage router={router} />} />
            </>
        );
    }
}
