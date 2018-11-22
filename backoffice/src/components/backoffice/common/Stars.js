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
            this.state.starArray = new Array(MAX_STARS).fill('star', 0, props.value).fill('star_empty', props.value, MAX_STARS);
        }
    }

    render() {
        return (
            <div className="Stars">
                {this.state.starArray.map((star, index) =>
                    <img key={index} src={`${process.env.PUBLIC_URL}/images/${star}.png`} style={{ width: '25px', opacity: star === 'star_empty' ? '0.6' : '1' }} />
                )}
            </div>
        );
    }
}
