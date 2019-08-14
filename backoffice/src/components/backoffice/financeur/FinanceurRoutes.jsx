import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Redirect, Route, Switch } from 'react-router-dom';
import queryString from 'query-string';
import MonComptePanel from '../account/MonComptePanel';
import FinancerPanel from './FinancerPanel';

export default class FinanceurRoutes extends React.Component {

    static propTypes = {
        profile: PropTypes.string.isRequired,
        codeRegion: PropTypes.string.isRequired,
        codeFinanceur: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        features: PropTypes.string.isRequired,
    };

    parse = location => {
        return queryString.parse(location.search);
    };

    render() {
        return (
            <div>
                <Switch>
                    <Redirect exact from="/" to="/admin/financeur" />
                    <Redirect exact from="/admin"
                        to="/admin/financeur" />
                </Switch>
                <Route path="/mon-compte" component={MonComptePanel} />
                <Route
                    path="/admin/financeur"
                    render={() => (
                        <div className="main">
                            <FinancerPanel
                                profile={this.props.profile}
                                id={this.props.id}
                                codeRegion={this.props.codeRegion}
                                codeFinanceur={this.props.codeFinanceur}
                                features={this.props.features} />
                        </div>
                    )} />
            </div>
        );
    }
}
