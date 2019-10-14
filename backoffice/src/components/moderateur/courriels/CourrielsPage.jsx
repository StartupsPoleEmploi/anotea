import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LeftArrow from './components/slider/LeftArrow';
import CarouselSlide from './components/slider/CarouselSlide';
import RightArrow from './components/slider/RightArrow';
import CarouselIndicator from './components/slider/CarouselIndicator';
import './CourrielsPage.scss';
import Page from '../../common/page/Page';
import Panel from '../../common/page/panel/Panel';

const carousels = {
    stagiaires: [
        {
            image: require('./images/Stag_DonnerVotreAvis.png'),
            content:
                'Donnez votre avis'
        }, {
            image: require('./images/Stag_AvisPublié.png'),
            content:
                'Avis publié'
        }, {
            image: require('./images/Stag_AvisRejeté.png'),
            content:
                'Avis rejeté pour injure'
        }
    ],
    organismes: [
        {
            image: require('./images/OF_NewMDP.png'),
            content:
                'Mail mot de passe oublié'
        }, {
            image: require('./images/OF_NonLus.png'),
            content:
                'Notification avis non lus'
        }, {
            image: require('./images/OF_ReponseRejeté.png'),
            content:
                'Réponse non prise en compte'
        }, {
            image: require('./images/OF_JoinAnotéa.png'),
            content:
                'Création de compte'
        }, {
            image: require('./images/OF_SignaléPublié.png'),
            content:
                'Avis signalé publié'
        }, {
            image: require('./images/OF_SignaléRejeté.png'),
            content:
                'Avis signalé rejeté'
        }
    ]
};

export default class CourrielsPanel extends Component {

    static propTypes = {
        type: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            activeIndex: 0
        };
    }

    goToSlide = index => {
        this.setState({
            activeIndex: index
        });
    };

    goToPrevSlide = e => {
        e.preventDefault();

        let index = this.state.activeIndex;
        let slidesLength = carousels[this.props.type].length;

        if (index < 1) {
            index = slidesLength;
        }

        --index;

        this.setState({
            activeIndex: index
        });
    };

    goToNextSlide = e => {
        e.preventDefault();

        let index = this.state.activeIndex;
        let slidesLength = carousels[this.props.type].length - 1;

        if (index === slidesLength) {
            index = -1;
        }

        ++index;

        this.setState({
            activeIndex: index
        });
    };

    render() {
        let carousel = carousels[this.props.type];
        return (
            <Page
                className="CourrielsPage"
                panel={
                    <Panel
                        results={
                            <div className="carousel-container">
                                <div className="carousel">

                                    <LeftArrow onClick={e => this.goToPrevSlide(e)} />

                                    <ul className="carousel__slides">
                                        {carousel.map((slide, index) =>
                                            <CarouselSlide
                                                key={index}
                                                index={index}
                                                activeIndex={this.state.activeIndex}
                                                slide={slide}
                                            />
                                        )}
                                    </ul>

                                    <RightArrow onClick={e => this.goToNextSlide(e)} />

                                    <ul className="carousel__indicators">
                                        {carousel.map((slide, index) =>
                                            <CarouselIndicator
                                                key={index}
                                                index={index}
                                                activeIndex={this.state.activeIndex}
                                                isActive={this.state.activeIndex === index}
                                                onClick={e => this.goToSlide(index)}
                                            />
                                        )}
                                    </ul>
                                </div>
                            </div>
                        }
                    />
                }
            />
        );
    }
}
