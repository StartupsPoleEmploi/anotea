import React from 'react';

import ModerationPanel from './moderation/ModerationPanel';
import OrganisationPanel from './organisation/OrganisationPanel';
import FinancerPanel from './financer/FinancerPanel';

export class Main extends React.Component {

    state = {}

    constructor(props) {
        super(props);
        this.state = {
            profile: props.profile,
            id: props.id,
            codeRegion: props.codeRegion,
            codeFinanceur: props.codeFinanceur,
            raisonSociale: props.raisonSociale
        };
    }

    render() {
        return (
            <div className="main">
                {this.state.profile === 'moderateur' &&
                <ModerationPanel
                    id={this.state.id}
                    codeRegion={this.state.codeRegion} />
                }
                {this.state.profile === 'organisme' &&
                <OrganisationPanel
                    id={this.state.id}
                    raisonSociale={this.state.raisonSociale} />
                }
                {this.state.profile === 'financer' &&
                <FinancerPanel
                    profile={this.state.profile}
                    id={this.state.id}
                    codeRegion={this.state.codeRegion}
                    codeFinanceur={this.state.codeFinanceur} />
                }
            </div>
        );
    }
}
