import React from 'react';

export const Logout = props => {
    return (
        <div className="logout">
            <button onClick={props.handleLogout} className="btn btn-primary btn-md">Se déconnecter <i
                className="glyphicon glyphicon-log-out"></i></button>
        </div>
    );
};
