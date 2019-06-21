import React, { Component } from 'react';

export default class DiversStatsTable extends Component {

    render() {

        return (
            <div className="row pt-3">
                <div className="col-sm-12">
                    <iframe className="embed-responsive-item" src="https://anotea.kibana.pole-emploi.fr/app/kibana#/dashboard/d545e8a0-4738-11e9-a788-0de26b41fc5f?embed=true&_g=(refreshInterval%3A(display%3A'30%20seconds'%2Cpause%3A!f%2Csection%3A1%2Cvalue%3A30000)%2Ctime%3A(from%3Anow-7d%2Cinterval%3Aauto%2Cmode%3Arelative%2Ctimezone%3AEurope%2FBerlin%2Cto%3Anow))" height="800" width="100%"></iframe>
                </div>
            </div>
        );
    }
}

