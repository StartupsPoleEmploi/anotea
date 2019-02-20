import React from 'react';
import Logout from './Logout';
import './header.css';
import { NavLink } from 'react-router-dom';

import { getRegion } from './../../financeur/service/financeurService';

const tab = [
    { code: '4', label: `Pôle Emploi ` },
    { code: '2', label: `Conseil régional ` },
    { code: '10', label: `Béneficiaire de l'action ` },
    { code: '0', label: `Autre ` },
    { code: '16', label: `OPCA ` },
    { code: '13', label: `Etat - Autre ` },
    { code: '5', label: `Entreprise ` },
    { code: '11', label: `Etat - Ministère chargé de l'emoploi ` },
    { code: '15', label: `Collectivité territoriale - Autre ` },
    { code: '14', label: `Fonds Européens - Autre ` },
    { code: '3', label: `Fonds Européens - FSE ` },
    { code: '12', label: `Etat - Ministère de l'éducation nationale ` },
    { code: '7', label: `AGEFIPH ` },
    { code: '17', label: `OPACIF ` },
    { code: '9', label: `Collectivité territoriale - Commune ` }
];

export default class DeprecatedHeader extends React.PureComponent {

    state = {
        region: '',
    };

    getLabel = code => tab.map(e => e.code === code ? (e.label) : '');

    getRegionName = (codeRegion) => {
        getRegion(codeRegion).then(region => {
            this.setState({ region: region.region })
        });
        return this.state.region;
    };

    render() {
        const { props } = this;

        return (
            <div className="App-header">
                <NavLink to="/">
                <img src={`${process.env.PUBLIC_URL}/images/logo.png`} className="App-logo" alt="logo" />
                {props.profile === 'organisme' ? <h5 className="label h5">{props.raisonSociale}</h5> :
                    props.profile === 'financeur' ?
                        <h1>Espace Financeur {this.getLabel(props.codeFinanceur)} {this.getRegionName(props.codeRegion)}</h1> :
                        <h1>Espace Anotea</h1>
                }
                </NavLink>
                {props.profile === 'organisme' && <a className="helpLink float-right"
                    href={`https://anotea.pole-emploi.fr/notices/notice-${props.codeRegion}.pdf`}>Aide</a>}

                {props.loggedIn &&
                    <div>
                        <NavLink to="/mon-compte" className="account-link"
                            activeClassName="active">
                            <span className="fas fa-cog" />
                        </NavLink>
                        <Logout handleLogout={props.handleLogout} />
                    </div>
                }
            </div>
        );
    }
};
