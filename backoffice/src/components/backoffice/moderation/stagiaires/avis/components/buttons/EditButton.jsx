import React from 'react';
import PropTypes from 'prop-types';
import './Button.scss';

export default class EditButton extends React.Component {

    static propTypes = {
        onClick: PropTypes.func.isRequired,
        buttonClassName: PropTypes.string.isRequired,
    };

    render() {
        return (
            <button
                type="button"
                className={`EditButton Button btn ${this.props.buttonClassName}`}
                onClick={this.props.onClick}>
                <i className="fa fa-pencil-alt" />
            </button>
        );
    }
}
