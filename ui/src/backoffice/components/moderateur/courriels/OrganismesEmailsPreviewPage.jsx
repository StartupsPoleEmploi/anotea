import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Page from '../../common/page/Page';
import Panel from '../../common/page/panel/Panel';
import { getEmailPreviewUrl } from '../../../services/emailsPreviewService';
import { Filter, Filters } from '../../common/page/panel/filters/Filters';
import './EmailsPreviewPage.scss';

export default class OrganismesEmailsPreviewPage extends Component {

    static propTypes = {
        router: PropTypes.object.isRequired,
    };

    onFilterClicked = parameters => {
        return this.props.router.refreshCurrentPage(parameters);
    };

    render() {

        let query = this.props.router.getQuery();

        return (
            <Page
                className="EmailsPreviewPage"
                panel={
                    <Panel
                        filters={
                            <Filters>
                                <Filter
                                    label="Activation compte dispensateur"
                                    isActive={() => query.templateName === 'activationCompteEmail' || !query.templateName}
                                    onClick={() => this.onFilterClicked({ templateName: 'activationCompteEmail' })}
                                />
                                <Filter
                                    label="Activation compte responsable"
                                    isActive={() => query.templateName === 'activationCompteEmailResponsable'}
                                    onClick={() => this.onFilterClicked({ templateName: 'activationCompteEmailResponsable' })}
                                />
                                <Filter
                                    label="Notification nouveaux avis"
                                    isActive={() => query.templateName === 'avisNotificationEmail'}
                                    onClick={() => this.onFilterClicked({ templateName: 'avisNotificationEmail' })}
                                />
                                <Filter
                                    label="Signalement annulé"
                                    isActive={() => query.templateName === 'avisReportedCanceledEmail'}
                                    onClick={() => this.onFilterClicked({ templateName: 'avisReportedCanceledEmail' })}
                                />
                                <Filter
                                    label="Signalement confirmé"
                                    isActive={() => query.templateName === 'avisReportedConfirmedEmail'}
                                    onClick={() => this.onFilterClicked({ templateName: 'avisReportedConfirmedEmail' })}
                                />
                                <Filter
                                    label="Réponse rejetée"
                                    isActive={() => query.templateName === 'reponseRejectedEmail'}
                                    onClick={() => this.onFilterClicked({ templateName: 'reponseRejectedEmail' })}
                                />
                            </Filters>
                        }
                        results={
                            <div className="row  justify-content-md-center">
                                <div className="col-md-6">
                                    <iframe
                                        title="Prévisualisation de l´email organismes"
                                        lang='fr'
                                        src={getEmailPreviewUrl('organismes', query.templateName || 'activationCompteEmail')}>
                                    </iframe>
                                </div>
                            </div>
                        }
                    />
                }
            />
        );
    }
}
