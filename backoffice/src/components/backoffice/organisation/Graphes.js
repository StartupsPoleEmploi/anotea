import React from 'react';
import { Pie, defaults } from 'react-chartjs-2';
import 'chartjs-plugin-labels';
import Modal from 'react-modal';
import PropTypes from 'prop-types';

import Stars from '../common/deprecated/Stars';

import './Graphes.scss';

import {
    getOrganisationStates
} from './service/organismeService';

const labels = ['Pas du tout satisfait (%)', 'Pas satisfait (%)', 'Moyennement satisfait (%)', 'Satisfait (%)', 'Très satisfait (%)'];
const backgroundColor = [
    'rgba(208, 2, 27, 1)',
    'rgba(255, 177, 93, 1)',
    'rgba(250, 218, 9, 1)',
    'rgba(27, 210, 164, 1)',
    'rgba(21, 94, 99, 1)',
];
const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
};

export default class Graphes extends React.Component {

    state = {
        modalIsOpen: false,
        countAdvices: '',
        accueil: {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: []
                }
            ]
        },
        noteGlobale: {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: []
                }
            ]
        },
        accompagnement: {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: []
                }
            ]
        },
        materiel: {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: []
                }
            ]
        },
        equipe: {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: []
                }
            ]
        },
        contenuFormation: {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: []
                }
            ]
        },
        traineeCount: 0
    };
    
    static propTypes = {
        organisationId: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        defaults.pie.plugins = {
            labels: {
                fontColor: 'black',
                fontStyle: 'bold',
                position: 'outside',
                textMargin: 4
            }
        };

        getOrganisationStates(props.organisationId).then(states => {
            if (states.length > 0) {
                console.log(states[0])
                this.setState({
                    countAdvices: states[0].countAdvices,
                    accueil: {
                        labels: labels,
                        datasets: [
                            {
                                data: [
                                    Math.round((states[0].accueilOne / states[0].countAdvices) * 100),
                                    Math.round((states[0].accueilTwo / states[0].countAdvices) * 100),
                                    Math.round((states[0].accueilThree / states[0].countAdvices) * 100),
                                    Math.round((states[0].accueilFour / states[0].countAdvices) * 100),
                                    Math.round((states[0].accueilFive / states[0].countAdvices) * 100),
                                ],
                                backgroundColor: backgroundColor,
                            }
                        ]
                    },
                    noteGlobale: {
                        labels: labels,
                        datasets: [
                            {
                                data: [
                                    Math.round((states[0].noteGlobaleOne / states[0].countAdvices) * 100),
                                    Math.round((states[0].noteGlobaleTwo / states[0].countAdvices) * 100),
                                    Math.round((states[0].noteGlobaleThree / states[0].countAdvices) * 100),
                                    Math.round((states[0].noteGlobaleFour / states[0].countAdvices) * 100),
                                    Math.round((states[0].noteGlobaleFive / states[0].countAdvices) * 100),
                                ],
                                backgroundColor: backgroundColor,
                            }
                        ]
                    },
                    accompagnement: {
                        labels: labels,
                        datasets: [
                            {
                                data: [
                                    Math.round((states[0].accompagnementOne / states[0].countAdvices) * 100),
                                    Math.round((states[0].accompagnementTwo / states[0].countAdvices) * 100),
                                    Math.round((states[0].accompagnementThree / states[0].countAdvices) * 100),
                                    Math.round((states[0].accompagnementFour / states[0].countAdvices) * 100),
                                    Math.round((states[0].accompagnementFive / states[0].countAdvices) * 100),
                                ],
                                backgroundColor: backgroundColor,
                            }
                        ]
                    },
                    materiel: {
                        labels: labels,
                        datasets: [
                            {
                                data: [
                                    Math.round((states[0].materielOne / states[0].countAdvices) * 100),
                                    Math.round((states[0].materielTwo / states[0].countAdvices) * 100),
                                    Math.round((states[0].materielThree / states[0].countAdvices) * 100),
                                    Math.round((states[0].materielFour / states[0].countAdvices) * 100),
                                    Math.round((states[0].materielFive / states[0].countAdvices) * 100),
                                ],
                                backgroundColor: backgroundColor,
                            }
                        ]
                    },
                    equipe: {
                        labels: labels,
                        datasets: [
                            {
                                data: [
                                    Math.round((states[0].equipeOne / states[0].countAdvices) * 100),
                                    Math.round((states[0].equipeTwo / states[0].countAdvices) * 100),
                                    Math.round((states[0].equipeThree / states[0].countAdvices) * 100),
                                    Math.round((states[0].equipeFour / states[0].countAdvices) * 100),
                                    Math.round((states[0].equipeFive / states[0].countAdvices) * 100),
                                ],
                                backgroundColor: backgroundColor,
                            }
                        ]
                    },
                    contenuFormation: {
                        labels: labels,
                        datasets: [
                            {
                                data: [
                                    Math.round((states[0].contenuFormationOne / states[0].countAdvices) * 100),
                                    Math.round((states[0].contenuFormationTwo / states[0].countAdvices) * 100),
                                    Math.round((states[0].contenuFormationThree / states[0].countAdvices) * 100),
                                    Math.round((states[0].contenuFormationFour / states[0].countAdvices) * 100),
                                    Math.round((states[0].contenuFormationFive / states[0].countAdvices) * 100),
                                ],
                                backgroundColor: backgroundColor,
                            }
                        ]
                    },
                    traineeCount: states[0].traineeCount,
                });
            } else {
                this.setState({
                    modalIsOpen: true
                });
            }
        });
    }

    closeModal = () => {
        this.setState({ modalIsOpen: false });
    };

    getTauxRepondants = () => {
        return `${(this.state.countAdvices / this.state.traineeCount * 100).toFixed(2).replace('.', ',')} %`;
    }

    render() {
        const { countAdvices } = this.state;
        return (
            <div className="graphes row">
                {countAdvices > 0 ?
                    (<div className="col-md-12">
                        <h2 className="graphe h2">Notes toutes formations confondues</h2>
                        <div className="row graphe">
                            <div className="col-md-10">
                                <div className="row">
                                    <div className="col-md-4">
                                        <Pie
                                            data={this.state.noteGlobale}
                                            options={{
                                                title: {
                                                    display: true,
                                                    text: `Note globale`
                                                },
                                                legend: {
                                                    display: false
                                                }
                                            }}
                                            width={'40%'}
                                            height={'30%'}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <Pie
                                            data={this.state.accueil}
                                            options={{
                                                title: {
                                                    display: true,
                                                    text: `L'accueil`
                                                },
                                                legend: {
                                                    display: false
                                                }
                                            }}
                                            width={'40%'}
                                            height={'30%'}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <Pie
                                            data={this.state.accompagnement}
                                            options={{
                                                title: {
                                                    display: true,
                                                    text: `Accompagnement`
                                                },
                                                legend: {
                                                    display: false
                                                }
                                            }}
                                            width={'40%'}
                                            height={'30%'}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-4">
                                        <Pie
                                            data={this.state.materiel}
                                            options={{
                                                title: {
                                                    display: true,
                                                    text: `Les moyens materiels`
                                                },
                                                legend: {
                                                    display: false
                                                }
                                            }}
                                            width={'40%'}
                                            height={'30%'}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <Pie
                                            data={this.state.equipe}
                                            options={{
                                                title: {
                                                    display: true,
                                                    text: `Équipe pédagogique`
                                                },
                                                legend: {
                                                    display: false
                                                }
                                            }}
                                            width={'40%'}
                                            height={'30%'}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <Pie
                                            data={this.state.contenuFormation}
                                            options={{
                                                title: {
                                                    display: true,
                                                    text: `Contenu`
                                                },
                                                legend: {
                                                    display: false
                                                }
                                            }}
                                            width={'40%'}
                                            height={'30%'}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <div>
                                    <span className="star five">&nbsp;&nbsp;&nbsp;</span>
                                    <Stars value={5} style={{ display: 'inline' }} />
                                    <p>Très satisfait</p>
                                </div>
                                <div>
                                    <span className="star four">&nbsp;&nbsp;&nbsp;</span>
                                    <Stars value={4} style={{ display: 'inline' }} />
                                    <p>Satisfait</p>
                                </div>
                                <div>
                                    <span className="star three">&nbsp;&nbsp;&nbsp;</span>
                                    <Stars value={3} style={{ display: 'inline' }} />
                                    <p>Moyennement satisfait</p>
                                </div>
                                <div>
                                    <span className="star two">&nbsp;&nbsp;&nbsp;</span>
                                    <Stars value={2} style={{ display: 'inline' }} />
                                    <p>Pas satisfait</p>
                                </div>
                                <div>
                                    <span className="star one">&nbsp;&nbsp;&nbsp;</span>
                                    <Stars value={1} style={{ display: 'inline' }} />
                                    <p>Pas du tout satisfait</p>
                                </div>
                                <div className="repondants">
                                    <h3>{this.getTauxRepondants()}</h3>
                                    <p>des stagiaires interrogés ont rempli le questionnaire</p>
                                </div>
                            </div>
                        </div>
                    </div>) :
                    (
                        <Modal
                            isOpen={this.state.modalIsOpen}
                            ariaHideApp={false}
                            style={customStyles}
                        >

                            <div className="pull-right">
                                <button className="btn btn-success btn-sm"
                                        onClick={this.closeModal}>
                                    Fermer <i className="glyphicon glyphicon glyphicon-remove" />
                                </button>
                            </div>
                            <h2> Aucun avis n'a été déposé pour votre organisme. </h2>
                        </Modal>
                    )
                }
            </div>
        );
    }

}
