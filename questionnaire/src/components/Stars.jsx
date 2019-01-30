import React from 'react';

import './stars.scss';

const MAX_STARS = 5;

export default class Stars extends React.PureComponent {

    state = {
        value: 0,
        starArray: [],
        hover: null,
        selected: null
    }

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
        }
    }

    removeHoverState = () => {
        this.setState({ hover: null });
    }

    render() {
        return (
            <div className="stars">
                {
                    this.state.starArray.map((star, index) =>
                        <span
                            key={index}
                            className={`${(this.state.hover <= index && this.state.selected <= index) ? 'far fa-star' : 'fas fa-star'}`}
                            style={{ width: '18px' }}
                            onMouseOver={this.updateHoverState.bind(this, index)}
                            onMouseOut={this.removeHoverState}
                            onClick={this.select.bind(this, index)}
                        />
                    )
                }
            </div>
        );
    }
}
