import React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

import { getOrganisationTrainings } from './service/organismeService';
import { getOrganisationLieuTrainingSessions } from '../financeur/avis/components/financeurService';
import PropTypes from 'prop-types';

export default class SearchForm extends React.Component {

    state = {
        currentTraining: '',
        trainingList: [],
        sessionList: []
    };

    constructor(props) {
        super(props);
        this.changeTrainingSession = props.changeTrainingSession;
        this.unsetTraining = props.unsetTraining;
    }

    static propTypes = {
        changeTrainingSession: PropTypes.func.isRequired,
        unsetTraining: PropTypes.func.isRequired,
        id: PropTypes.string,
        codeINSEE: PropTypes.string,
        currentEntity: PropTypes.object,
    }

    componentWillReceiveProps = nextProps => {
        if (nextProps.id !== null && !!nextProps.currentEntity) {
            if (nextProps.id !== this.state.organisationId || nextProps.currentEntity.codeINSEE !== this.state.codeINSEE) {
                getOrganisationTrainings(nextProps.id, nextProps.currentEntity.codeINSEE).then(trainings => {
                    this.setState({
                        organisationId: nextProps.id,
                        codeINSEE: nextProps.currentEntity.codeINSEE,
                        currentTraining: null,
                        trainingList: trainings,
                        sessionList: [],
                    });
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
            getOrganisationLieuTrainingSessions(this.state.organisationId, training._id, this.props.currentEntity.codeINSEE).then(sessions => {
                if (sessions.length > 0) {
                    this.setState({
                        sessionList: sessions,
                        currentSession: sessions[0].codeINSEE
                    });
                }
            });
        });
    };

    unsetCurrentTraining = () => {
        this.setState(Object.assign(this.state, {
            currentTraining: '',
        }), () => {
            this.unsetTraining();
        });
    };

    render() {
        const { currentTraining } = this.state;

        return (
            this.state.trainingList.length > 0 &&
            <div className="SearchForm">
                <h2 className="subtitle">
                    {currentTraining &&
                    <div>
                        <strong>Formation : {' '}
                            {currentTraining.title}
                            <small>({currentTraining.count} avis)</small>
                        </strong>
                        <button type="button" className="close" aria-label="Close" onClick={this.unsetCurrentTraining}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
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
        );
    }

}
