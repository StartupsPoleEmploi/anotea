import React from 'react';
import PropTypes from 'prop-types';

const MAX_STARS = 5;

export default class Stars extends React.PureComponent {

    state = {
        starArray: []
    }

    static propTypes = {
        value: PropTypes.number.isRequired,
        style: PropTypes.any
    }

    constructor(props) {
        super(props);
        if (props.value !== null) {
            this.state.starArray = new Array(MAX_STARS)
            .fill('star', 0, props.value)
            .fill('star_empty', props.value, MAX_STARS);
        }
    }

    render() {
        return (
            <span className="Stars" style={this.props.style}>
                {
                    this.state.starArray.map((star, index) =>
                        <span
                            key={index}
                            className={star === 'star_empty' ? 'far fa-star' : 'fas fa-star'}
                            style={{ width: '18px' }}
                        />
                    )
                }
            </span>
        );
    }
}
