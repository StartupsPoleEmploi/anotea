import React from 'react';
import PropTypes from 'prop-types';
import './Header.scss';
import { NavLink, Route } from 'react-router-dom';
import logo from './Header.svg';
import { getStats } from './../moderateur/moderation/moderationService';
import ModerateurHeaderItems from './ModerateurHeaderItems';
import FinanceurHeaderItems from './FinanceurHeaderItems';

export default class Header extends React.Component {

    state = {};

    static propTypes = {
        onLogout: PropTypes.func.isRequired,
        profile: PropTypes.string.isRequired
    };

    componentDidMount() {
        if (this.props.profile === 'moderateur') {
            this.fetchStats();
        }
    }

    fetchStats = (options = {}) => {
        return new Promise(resolve => {
            this.setState({ loading: !options.silent }, async () => {
                let stats = await getStats();
                let avis = stats.status.none;
                let reponses = stats.reponseStatus.none;
                this.setState({ avis, reponses, loading: false }, () => resolve());
            });
        });
    };

    render() {
        const { profile } = this.props;

        return (
            <Route render={({ location }) => {

                let isModeration = location.pathname.indexOf('/admin/moderateur/moderation/avis') !== -1;
                let isOrganismesTemplates = location.pathname.indexOf('/admin/courriels/templates-organismes') !== -1;
                let isStagiairesTemplates = location.pathname.indexOf('/admin/courriels/templates-stagiaires') !== -1;

                return (
                    <div className={`Header ${profile === 'financeur' || isModeration ? 'blue' : 'misc'}`}>
                        <div className="container">
                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                                        <NavLink to="/admin">
                                            <img src={logo} className="logo" alt="logo" />
                                        </NavLink>

                                        {profile === 'moderateur' &&
                                            <ModerateurHeaderItems
                                                isModeration={isModeration}
                                                isOrganismesTemplates={isOrganismesTemplates}
                                                isStagiairesTemplates={isStagiairesTemplates}
                                                avis={this.state.avis}
                                                reponses={this.state.reponses}
                                                loading={this.state.loading}
                                            />
                                        }

                                        {profile === 'financeur' &&
                                            <FinanceurHeaderItems />
                                        }
                                        
                                        <button
                                            onClick={this.props.onLogout}
                                            className="logout btn btn-outline-light">
                                            <span>SE DECONNECTER</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }}/>
        );
    }
}
