import React from 'react';

import PropTypes from 'prop-types';

export default class Logout extends React.PureComponent {

    static propTypes = {
        handleLogout: PropTypes.func.isRequired
    }

    render() {
        return (
            <div className="logout">
                <button onClick={this.props.handleLogout} className="btn btn-primary btn-md">
                    <span className="fas fa-sign-out-alt"/> Se déconnecter
                </button>
            </div>
        );
    }
}
