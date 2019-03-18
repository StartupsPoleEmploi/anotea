import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './foldButton.scss';

class FoldButton extends Component {

    state = {
        folded: false
    }

    static propTypes = {
        onFold: PropTypes.func.isRequired,
        onUnfold: PropTypes.func.isRequired,
        folded: PropTypes.bool
    };

    constructor(props) {
        super(props);
        this.state.folded = props.folded === true;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.folded) {
            this.setState({ folded: nextProps.folded });
        }
    }

    click = () => {
        let folded = !this.state.folded;
        this.setState({ folded: folded });
        if (folded) {
            this.props.onFold();
        } else {
            this.props.onUnfold();
        }
    }

    render() {
        return (
            <div className="foldButton">
                <i className={`fas ${this.state.folded ? 'fa-chevron-down' : 'fa-chevron-up'}`}
                   onClick={this.click}></i>
            </div>
        );
    }
}

export default FoldButton;
