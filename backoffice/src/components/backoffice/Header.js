import React from 'react';

import { Logout } from './Logout';

export const Header = props => {

    return(
        <div className="App-header">
            <img src='/images/logo.png' className="App-logo" alt="logo" />
            { props.profile === 'organisme' ? <h5 className=" label h5">{props.raisonSociale}</h5> :
                props.profile === 'financer' && props.codeRegion === '11' && props.codeFinanceur === '4' ? <h1>Espace Financeur Pôle Emploi IDF</h1> :
                    props.profile === 'financer' && props.codeRegion === '11' && props.codeFinanceur === '2' ?  <h1>Espace Financeur Pôle Emploi IDF</h1> :
                        props.profile === 'financer' && props.codeRegion === '17' && props.codeFinanceur === '4' ?  <h1>Espace Financeur Pôle Emploi PDL</h1> :
                            props.profile === 'financer' && props.codeRegion === '17' && props.codeFinanceur === '4' ?  <h1>Espace Financeur Conseil Régional PDL</h1> :
                                <h1>Espace Anotea</h1>
            }
            { props.loggedIn && <Logout handleLogout={props.handleLogout} /> }
        </div>
    );
};