import React from 'react';
import Logout from './Logout';
import './header.css';
import logo from '../../common/Header.svg';
import { NavLink } from 'react-router-dom';

import financeurs from './../../constantes/financeurs';
import regions from './../../constantes/regions';

export default class DeprecatedHeader extends React.PureComponent {

    getLabel = code => financeurs.map(e => e.code === code ? (e.label) : '');

    getRegionName = codeRegion => {
        let region = regions.find(e => e.codeRegion === codeRegion);
        return region ? region.nom : null;
    };

    render() {
        const { props } = this;

        return (
            <div className="App-header">
                <NavLink to="/">
                    <img src={logo} className="App-logo" alt="logo" />
                    {props.profile === 'organisme' ? <h5 className="label h5">{props.raisonSociale}</h5> :
                        props.profile === 'financeur' ?
                            <h1>Espace
                                Financeur {this.getLabel(props.codeFinanceur)} {this.getRegionName(props.codeRegion)}</h1> :
                            null
                    }
                </NavLink>
                {props.profile === 'organisme' &&
                    <a className="helpLink float-right"
                        href={`https://anotea.pole-emploi.fr/notices/notice-${props.codeRegion}.pdf`}>Aide
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
