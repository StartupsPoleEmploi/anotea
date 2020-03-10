import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch } from 'react-router-dom';
import GestionOrganismePage from './gestion-organismes/GestionOrganismePage';
import StagiairesEmailsPreviewPage from './courriels/StagiairesEmailsPreviewPage';
import ModerationAvisPage from './moderation-avis/ModerationAvisPage';
import ModerationReponsesPage from './moderation-avis/ModerationReponsesPage';
import MonComptePage from '../common/MonComptePage';
import OrganismesEmailsPreviewPage from './courriels/OrganismesEmailsPreviewPage';

export default class ModerateurRoutes extends React.Component {

    static propTypes = {
        router: PropTypes.object.isRequired,
    };

    render() {
        let { router } = this.props;

        return (
            <Switch>
                <Route path="/backoffice/moderateur/moderation/avis/stagiaires" render={() => {
                    return <ModerationAvisPage router={router} />;
                }} />
                <Route path="/backoffice/moderateur/moderation/avis/reponses" render={() => {
                    return <ModerationReponsesPage router={router} />;
                }} />
                <Route path="/backoffice/moderateur/emails/stagiaires" render={() => {
                    return <StagiairesEmailsPreviewPage router={router} />;
                }} />
                <Route path="/backoffice/moderateur/emails/organismes" render={() => {
                    return <OrganismesEmailsPreviewPage router={router} />;
                }} />
                <Route path="/backoffice/moderateur/gestion/organismes" render={() => {
                    return <GestionOrganismePage router={router} />;
                }}
                />
                <Route path={'/backoffice/moderateur/mon-compte'} component={MonComptePage} />
                <Redirect to="/backoffice/moderateur/moderation/avis/stagiaires?sortBy=lastStatusUpdate&statuses=none" />
            </Switch>
        );
    }
}
