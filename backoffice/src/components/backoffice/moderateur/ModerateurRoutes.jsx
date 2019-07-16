import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Redirect, Route, Switch } from 'react-router-dom';
import queryString from 'query-string';
import OrganismePanel from './gestion/organismes/OrganismePanel';
import AvisStagiairesPanel from './moderation/AvisStagiairesPanel';
import AvisReponsesPanel from './moderation/AvisReponsesPanel';
import MonComptePanel from '../account/MonComptePanel';
import TemplatesMail from './moderation/TemplatesMailPanel';

const carouselSlidesDataStagiaires = [
    {
        image: require('../common/slide/images/stagiaire_commentaire_rejeté.PNG'),
        content:
        'Rejet pour injure'
    }, {
        image: require('../common/slide/images/stagiaire_avis_formation.PNG'),
        content:
        'Donnez votre avis'
    }
];

const carouselSlidesDataOrganismes = [
    {
        image: require('../common/slide/images/organismes_accès_compte.PNG'),
        content:
        'Création de compte'
    }, {
        image: require('../common/slide/images/organismes_renouvellement_mdp.PNG'),
        content:
        'Mail mot de passe oublié'
    }, {
        image: require('../common/slide/images/organismes_réponse_rejetée.PNG'),
        content:
        'Mail avis signalé'
    }
];

export default class ModerateurRoutes extends React.Component {

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
    };

    parse = location => {
        return queryString.parse(location.search);
    };

    buildParameters = options => {
        let newQuery = _(_.merge({ page: 0 }, options))
        .omitBy(_.isNil)
        .omitBy(value => value === '')
        .value();

        return queryString.stringify(newQuery);
    };

    render() {
        return (
            <div>
                <Switch>
                    <Redirect exact from="/" to="/admin/moderateur/moderation/avis/stagiaires?page=0&status=none" />
                    <Redirect exact from="/admin"
                        to="/admin/moderateur/moderation/avis/stagiaires?page=0&status=none" />
                </Switch>
                <Route path="/mon-compte" component={MonComptePanel} />
                <Route path="/mail-templates-stagiaires" render={() => <TemplatesMail carouselSlidesData={carouselSlidesDataStagiaires}/>} />
                <Route path="/mail-templates-organismes" render={() => <TemplatesMail carouselSlidesData={carouselSlidesDataOrganismes}/>} />
                <Route
                    path="/admin/moderateur/gestion/organismes"
                    render={({ history, location }) => {
                        return <OrganismePanel
                            codeRegion={this.props.codeRegion}
                            query={this.parse(location)}
                            onNewQuery={options => {
                                history.push(`/admin/moderateur/gestion/organismes?${this.buildParameters(options)}`);
                            }} />;
                    }} />
                <Route
                    path="/admin/moderateur/moderation/avis/stagiaires"
                    render={({ history, location }) => {
                        return <AvisStagiairesPanel
                            codeRegion={this.props.codeRegion}
                            query={this.parse(location)}
                            onNewQuery={options => {
                                history.push(`/admin/moderateur/moderation/avis/stagiaires?${this.buildParameters(options)}`);
                            }} />;
                    }} />
                <Route
                    path="/admin/moderateur/moderation/avis/reponses"
                    render={({ history, location }) => {
                        return <AvisReponsesPanel
                            codeRegion={this.props.codeRegion}
                            query={this.parse(location)}
                            onNewQuery={options => {
                                history.push(`/admin/moderateur/moderation/avis/reponses?${this.buildParameters(options)}`);
                            }} />;
                    }} />
            </div>
        );
    }
}
