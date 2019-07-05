import React from 'react';
import PropTypes from 'prop-types';
import Logout from './Logout';
import './header.css';
import logo from '../../common/Header.svg';
import { NavLink } from 'react-router-dom';

import financeurs from './../../constantes/financeurs';
import regions from './../../constantes/regions';

export default class DeprecatedHeader extends React.PureComponent {

    static propTypes = {
        codeFinanceur: PropTypes.string.isRequired,
        codeRegion: PropTypes.string.isRequired,
    };

    getLabel = code => financeurs.map(e => e.code === code ? (e.label) : '');

    getRegionName = codeRegion => {
        let region = regions.find(e => e.codeRegion === codeRegion);
        return region ? region.nom : null;
    };

    getUrl = () => {
        return process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/stats/avis` : 'http://localhost:3003/stats/avis';
    }

    getFinanceurHeader = () => {
        return (
            <div className="financeur-header">
                <h1 className="financer-header-title">
                    Espace Financeur {this.getLabel(this.props.codeFinanceur)}
                    {this.getRegionName(this.props.codeRegion)}
                </h1>
                <a target="_blank"
                    rel="noopener noreferrer"
                    href={this.getUrl()}
                    className="stats-link"><span className="fas fa-chart-line" /> Avis - Statistiques
                </a>
            </div>
        );
    }
    

    render() {
        const { props } = this;

        return (
            <div className="App-header">
                <NavLink to="/">
                    <img src={logo} className="App-logo" alt="logo" />
                    {props.profile === 'organisme' && <h5 className="label h5">{props.raisonSociale}</h5>}
                    {props.profile === 'financeur' && this.getFinanceurHeader()}

                </NavLink>
                {props.profile === 'organisme' &&
                    <a className="helpLink float-right"
                        href={`https://anotea.pole-emploi.fr/static/notices/notice-${props.codeRegion}.pdf`}>Aide
                    </a>
                }

                {props.loggedIn &&
                    <div>
                        <NavLink to="/mon-compte"
                            className="account-link"
                            activeClassName="active">
                            <span className="fas fa-cog" />
                        </NavLink>
                        <Logout handleLogout={props.handleLogout} />
                    </div>
                }
            </div>
        );
    }
}
