import React from 'react';
import PropTypes from 'prop-types';
import Logout from '../Logout';
import './header.css';
import logo from '../../header/Header.svg';
import { NavLink } from 'react-router-dom';

import financeurs from './financeurs';
import regions from './regions';

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
        return 'https://anotea.pole-emploi.fr/stats/avis';
    }

    getFinanceurHeader = () => {
        return (
            <div className="financeur-header">
                <h1 className="financer-header-title">
                    Espace Financeur {this.getLabel(this.props.codeFinanceur)}
                    {this.getRegionName(this.props.codeRegion)}
                </h1>
                <a href={this.getUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="stats-link"><span className="fas fa-chart-line" /> Statistiques
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
                    {props.profile === 'organisme' && <h1 className="organisme-header-title">{props.raisonSociale}</h1>}
                </NavLink>
                {props.profile === 'financeur' && this.getFinanceurHeader()}


                {props.loggedIn &&
                    <div>
                        <NavLink to="/mon-compte"
                            className="account-link"
                            activeClassName="active">
                            {props.profile === 'organisme' &&
                                <a className="helpLink"
                                    href={`https://anotea.pole-emploi.fr/static/notices/notice-${props.codeRegion}.pdf`}>Aide&nbsp;&nbsp;
                                </a>
                            }
                            <span className="fas fa-cog" />
                        </NavLink>
                        <Logout handleLogout={props.handleLogout} />
                    </div>
                }
            </div>
        );
    }
}
