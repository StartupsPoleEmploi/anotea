import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './note.scss';

const MAX_STARS = 5;
const tooltipLabels = ['Pas du tout satisfait', 'Pas satisfait', 'Moyennement satisfait', 'Satisfait', 'Très satisfait'];
const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;


class Note extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        onSelect: PropTypes.func.isRequired,
        index: PropTypes.number.isRequired,
        value: PropTypes.number
    };

    state = {
        value: 0,
        starArray: [],
        hover: null,
        selected: null
    };

    constructor(props) {
        super(props);

        if (props.value) {
            this.state.value = Math.round(props.value);
            this.state.selected = Math.round(props.value);
        }

        this.state.starArray = new Array(MAX_STARS)
        .fill('star', 0, MAX_STARS);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value) {
            this.setState({ value: nextProps.value, selected: Math.round(nextProps.value) });
        }
    }

    select = value => {
        this.setState({ selected: value + 1 });
        this.props.onSelect(this.props.index, value);
    };

    getStarClass = index => {
        if (this.state.value % 1 !== 0) {
            if (this.state.selected === index + 1) {
                return 'fas fa-star';
            } else if (this.state.selected - 1 > index) {
                return 'fas fa-star';
            } else {
                return 'fas fa-star inactive';
            }
        } else {
            // eslint-disable-next-line no-lonely-if
            if (this.state.hover <= index && this.state.selected <= index) {
                return 'fas fa-star inactive';
            } else {
                return 'fas fa-star';
            }
        }
    };

    onMouseOverStar = index => {
        if (iOS) {
            this.select(index);
        } else if (!this.state.readonly) {
            this.setState({ hover: index + 1 });
        }
    };

    onMouseOutStar = () => {
        if (!iOS) {
            this.setState({ hover: null });
        }
    };

    render() {
        let isTooltipActive = (this.state.hover !== null || this.state.selected !== null) && !this.state.readonly;
        let tooltipLabel = tooltipLabels[this.state.hover !== null ? this.state.hover - 1 : this.state.selected - 1];

        return (
            <div className="note">
                <div className={`row inner-row align-items-top`}>
                    <div className="col-sm-7 pt-3">
                        <div className="title">{this.props.title}</div>
                        <div className="description pt-1">{this.props.description}</div>
                    </div>
                    <div className="col-sm-5 pt-3 stars-container">
                        <div className="title d-none d-sm-block">&nbsp;</div>
                        <div className="stars d-flex justify-content-start justify-content-sm-end align-items-start align-items-center">
                            <div className="buttons">
                                <div className={`star-tooltip ${isTooltipActive ? 'active' : 'inactive'}`}>
                                    <span className="label">{tooltipLabel}</span>
                                </div>
                                {
                                    this.state.starArray.map((star, index) =>
                                        <button
                                            key={index}
                                            className={`star ${this.getStarClass(index)}`}
                                            onMouseOver={this.onMouseOverStar.bind(this, index)}
                                            onMouseOut={this.onMouseOutStar.bind(this)}
                                            onClick={this.select.bind(this, index)}
                                        />
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Note;
