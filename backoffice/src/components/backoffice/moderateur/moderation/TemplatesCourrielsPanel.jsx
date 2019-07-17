import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Panel from '../../common/panel/Panel';
import LeftArrow from '../../common/slide/LeftArrow';
import CarouselSlide from '../../common/slide/CarouselSlide';
import RightArrow from '../../common/slide/RightArrow';
import CarouselIndicator from '../../common/slide/CarouselIndicator';
import './TemplateCourrielsPanel.scss';

export default class TemplatesCourrielsPanel extends Component {

    static propTypes = {
        carouselSlidesData: PropTypes.array.isRequired,
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
    }

    goToPrevSlide = e => {
        e.preventDefault();
    
        let index = this.state.activeIndex;
        let slidesLength = this.props.carouselSlidesData.length;
    
        if (index < 1) {
            index = slidesLength;
        }
    
        --index;
    
        this.setState({
            activeIndex: index
        });
    }

    goToNextSlide = e => {
        e.preventDefault();
    
        let index = this.state.activeIndex;
        let slidesLength = this.props.carouselSlidesData.length - 1;
    
        if (index === slidesLength) {
            index = -1;
        }
    
        ++index;
    
        this.setState({
            activeIndex: index
        });
    }

    render() {
        return (
            <div>
                <Panel
                    className={'OrganismePanel'}
                    header={
                        <div>
                            <h1 className="title">Modèles de courriel</h1>
                        </div>
                    }
                />
                <div className="carousel-container">
                    <div className="carousel">
                        
                        <LeftArrow onClick={e => this.goToPrevSlide(e)} />
    
                        <ul className="carousel__slides">
                            {this.props.carouselSlidesData.map((slide, index) =>
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
                            {this.props.carouselSlidesData.map((slide, index) =>
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
            </div>
        );
    }
}
