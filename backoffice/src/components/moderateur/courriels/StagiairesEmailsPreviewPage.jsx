import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Page from '../../common/page/Page';
import Panel from '../../common/page/panel/Panel';
import { getEmailPreviewUrl } from '../../../services/emailsPreviewService';
import { Filter, Filters } from '../../common/page/panel/filters/Filters';
import './EmailsPreviewPage.scss';

export default class StagiairesEmailsPreviewPage extends Component {

    static propTypes = {
        navigator: PropTypes.object.isRequired,
    };

    onFilterClicked = parameters => {
        return this.props.navigator.refreshCurrentPage(parameters);
    };

    render() {

        let query = this.props.navigator.getQuery();

        return (
            <Page
                className="EmailsPreviewPage"
                panel={
                    <Panel
                        filters={
                            <Filters>
                                <Filter
                                    label="Avis stagiaires"
                                    isActive={() => query.templateName === 'avisStagiaireEmail' || !query.templateName}
                                    onClick={() => this.onFilterClicked({ templateName: 'avisStagiaireEmail' })}
                                />
                                <Filter
                                    label="Avis rejeté (alerte)"
                                    isActive={() => query.templateName === 'avisRejectedAlerteEmail'}
                                    onClick={() => this.onFilterClicked({ templateName: 'avisRejectedAlerteEmail' })}
                                />
                                <Filter
                                    label="Avis rejeté (injure)"
                                    isActive={() => query.templateName === 'avisRejectedInjureEmail'}
                                    onClick={() => this.onFilterClicked({ templateName: 'avisRejectedInjureEmail' })}
                                />
                            </Filters>
                        }
                        results={
                            <div className="row  justify-content-md-center">
                                <div className="col-md-6">
                                    <iframe src={getEmailPreviewUrl('stagiaires', query.templateName || 'avisStagiaireEmail')}>
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
