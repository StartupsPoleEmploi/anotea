import React from 'react';

import PropTypes from 'prop-types';

const MAX_STARS = 5;

export default class Stars extends React.PureComponent {

    state = {
        starArray: []
    }

    static propTypes = {
        value: PropTypes.number.isRequired
    }

    constructor(props) {
        super(props);
        if (props.value !== null) {
            this.state.starArray = new Array(MAX_STARS).fill('oi oi-star', 0, props.value);
        }
    }

    render() {
        return (
            <div className="Stars">
                {this.state.starArray.map((star, index) =>
                    <span key={index} className={star}></span>
                )}
            </div>
        );
    }
}
