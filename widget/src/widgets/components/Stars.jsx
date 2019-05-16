import React from 'react';
import PropTypes from 'prop-types';

export default class Stars extends React.PureComponent {

    state = {
        starArray: []
    };

    static propTypes = {
        value: PropTypes.number.isRequired
    };

    constructor(props) {
        super(props);
        const MAX_STARS = 5;
        if (props.value !== null) {
            this.state.starArray = new Array(MAX_STARS)
            .fill('star', 0, props.value)
            .fill('star_empty', props.value, MAX_STARS);
        }
    }

    render() {
        return (
            <span className="stars">
                {
                    this.state.starArray.map((star, index) => {
                        return <span
                            key={index}
                            className={star === 'star_empty' ? 'fas fa-star' : 'fas fa-star active'}
                            style={{ width: '18px' }}
                        />;
                    })
                }
            </span>
        );
    }
}
