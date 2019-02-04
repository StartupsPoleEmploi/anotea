import React from 'react';

import PropTypes from 'prop-types';

import './stars.scss';

const MAX_STARS = 5;
const tooltipLabels = ['Pas du tout satisfait', 'Pas satisfait', 'Moyennement satisfait', 'Satisfait', 'Très satisfait'];

export default class Stars extends React.PureComponent {

    state = {
        value: 0,
        starArray: [],
        hover: null,
        selected: null
    }

    static propTypes = {
        onSelect: PropTypes.func.isRequired,
        index: PropTypes.number.isRequired
    };

    constructor(props) {
        super(props);
        this.state.starArray = new Array(MAX_STARS)
        .fill('star', 0, this.state.value)
        .fill('star_empty', this.state.value, MAX_STARS);
    }

    updateHoverState = value => {
        this.setState({ hover: value + 1 });
    }

    select = value => {
        if (this.state.selected === value + 1) {
            this.setState({ selected: null });
        } else {
            this.setState({ selected: value + 1 });
            this.props.onSelect(this.props.index, value);
        }
    }

    removeHoverState = () => {
        this.setState({ hover: null });
    }

    render() {
        return (
            <div className="stars">
                <div className="tooltipBlock">
                    <span className={`tooltip ${(this.state.hover !== null || this.state.selected !== null) ? 'active' : 'inactive'}`}>
                        {tooltipLabels[this.state.hover !== null ? this.state.hover - 1 : this.state.selected - 1]}
                    </span>
                </div>
                {
                    this.state.starArray.map((star, index) =>
                        <div className="starBlock" key={index}>
                            <span
                                className={`star ${(this.state.hover <= index && this.state.selected <= index) ? 'far fa-star' : 'fas fa-star'}`}
                                style={{ width: '18px' }}
                                onMouseOver={this.updateHoverState.bind(this, index)}
                                onMouseOut={this.removeHoverState}
                                onClick={this.select.bind(this, index)}
                            />
                        </div>
                    )
                }
            </div>
        );
    }
}
