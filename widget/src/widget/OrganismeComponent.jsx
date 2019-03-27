import React, { Component } from 'react';

class OrganismeComponent extends Component {

    render() {
        return (
            <div>
                Organisme {this.props.siret}
            </div>
        );
    }
}

export default OrganismeComponent;
