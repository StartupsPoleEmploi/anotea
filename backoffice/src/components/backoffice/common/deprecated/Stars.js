import React from 'react';
import PropTypes from 'prop-types';

const MAX_STARS = 5;

export default class Stars extends React.PureComponent {

    state = {
        starArray: []
    };

    static propTypes = {
        value: PropTypes.number.isRequired,
        style: PropTypes.any
    };

    constructor(props) {
        super(props);
        if (props.value !== null) {
            this.state.starArray = new Array(MAX_STARS)
            .fill('star', 0, Math.ceil(props.value))
            .fill('star_empty', Math.ceil(props.value), MAX_STARS);
        }
    }

    render() {
        let note = this.props.value;
        return (
            <span className="Stars" style={this.props.style}>
                {
                    this.state.starArray.map((star, index) => {
                        let starClass = (note % 1 !== 0 && Math.ceil(note) === index + 1) ? 'fa-star-half-alt' : 'fa-star';
                        return (
                            <span
                                key={index}
                                className={star === 'star_empty' ? 'far fa-star' : `fas ${starClass}`}
                                style={{ width: '18px' }}
                            />
                        );
                    })
                }
            </span>
        );
    }
}
