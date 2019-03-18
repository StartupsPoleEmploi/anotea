import React from 'react';

import PropTypes from 'prop-types';

import './stars.scss';

const MAX_STARS = 5;
const tooltipLabels = ['Pas du tout satisfait', 'Pas satisfait', 'Moyennement satisfait', 'Satisfait', 'Très satisfait'];
const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

export default class Stars extends React.PureComponent {

    state = {
        value: 0,
        starArray: [],
        hover: null,
        selected: null
    };

    static propTypes = {
        onSelect: PropTypes.func,
        index: PropTypes.number,
        readonly: PropTypes.bool,
        value: PropTypes.number,
        className: PropTypes.string
    };

    constructor(props) {
        super(props);
        this.state.readonly = props.readonly;

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
        if (!this.state.readonly) {
            if (this.state.selected === value + 1) {
                this.setState({ selected: null });
                this.props.onSelect(this.props.index, null);
            } else {
                this.setState({ selected: value + 1 });
                this.props.onSelect(this.props.index, value);
            }
        }
    };

    getStarClass = index => {
        if (this.state.value % 1 !== 0) {
            if (this.state.selected === index + 1) {
                return 'fas fa-star';
            } else if (this.state.selected - 1 > index) {
                return 'fas fa-star';
            } else {
                return 'far fa-star';
            }
        } else {
            // eslint-disable-next-line no-lonely-if
            if (this.state.hover <= index && this.state.selected <= index) {
                return 'far fa-star';
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
            <div className={`stars ${this.state.readonly ? 'readonly' : ''}`}>
                <div className="buttons">
                    <div className={`star-tooltip ${isTooltipActive ? 'active' : 'inactive'}`}>
                        <span className="label">{tooltipLabel}</span>
                    </div>
                    {
                        this.state.starArray.map((star, index) =>
                            <button
                                key={index}
                                className={`star ${this.getStarClass(index)} ${this.props.className || ''}`}
                                onMouseOver={this.onMouseOverStar.bind(this, index)}
                                onMouseOut={this.onMouseOutStar.bind(this)}
                                onClick={this.select.bind(this, index)}
                            />
                        )
                    }
                </div>
            </div>
        );
    }
}
