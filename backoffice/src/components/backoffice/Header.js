import React from 'react';

import { Logout } from './Logout';

export const Header = props => {
    return (
        <div className="App-header">

            <img src="images/logo.png" className="App-logo" alt="logo" />
            {props.profile === 'organisme' ?
                <h5 className=" label h5">{props.raisonSociale}</h5> : props.profile === 'financer' ?
                    <h1>Espace Financeur</h1> : <h1>Espace Anotea</h1>}
            {props.loggedIn && <Logout handleLogout={props.handleLogout} />}
        </div>
    );
};
