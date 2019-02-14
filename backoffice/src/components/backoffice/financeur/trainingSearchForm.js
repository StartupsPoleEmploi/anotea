import React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

import { getOrganisationLieuTrainings, getOrganisationLieuTrainingSessions } from './service/financeurService';

export default class TrainingSearchForm extends React.PureComponent {

    state = {
        currentTraining: null,
        trainingList: [],
        sessionList: [],
    }

    constructor(props) {
        super(props);
        this.changeTrainingSession = props.changeTrainingSession;
    }

    componentWillReceiveProps = async nextProps => {
        if (nextProps.id && nextProps.currentEntity) {
            if (nextProps.id !== this.state.organisationId || nextProps.currentEntity._id !== this.state.postalCode) {
                const trainings = await getOrganisationLieuTrainings(nextProps.codeRegion, nextProps.codeFinanceur, nextProps.id, nextProps.currentEntity._id);

                this.setState({
                    organisationId: nextProps.id,
                    postalCode: nextProps.currentEntity._id,
                    currentTraining: null,
                    trainingList: trainings,
                    sessionList: [],
                });
            }
        }
    };

    changeTraining = options => {
        const training = this.state.trainingList.filter(training => {
            if (training._id === options.id) {
                return training;
            }
        })[0];
        this.setState({ currentTraining: training }, () => {
            this.changeTrainingSession(training._id, this.props.currentEntity._id);
            getOrganisationLieuTrainingSessions(this.state.organisationId, training._id, this.props.currentEntity._id).then(sessions => {
                if (sessions.length > 0) {
                    this.setState({
                        sessionList: sessions,
                        currentSession: sessions[0].postalCode
                    });
                }
            });
        });
    };

    render() {
        return (
            this.state.trainingList.length > 0 &&
            <div className="SearchForm">
                <div className="row">
                    <div className="col-md-6">
                        <h3>Sélectionner une formation</h3>

                        <h2 className="subtitle">
                            {this.state.currentTraining &&
                            <strong>Formation : {' '}
                                {this.state.currentTraining.title}
                                <small>({this.state.currentTraining.count} avis)</small>
                            </strong>
                            }
                            <div className="dropdown">
                                <Select
                                    onChange={this.changeTraining}
                                    options={this.state.trainingList.map(training => ({
                                        label: training.title + ` (` + training.count + `avis)`,
                                        id: training._id
                                    }))}
                                    placeholder="Chercher et sélectionner une formation"
                                />
                            </div>
                        </h2>
                    </div>
                </div>
            </div>
        );
    }

}
