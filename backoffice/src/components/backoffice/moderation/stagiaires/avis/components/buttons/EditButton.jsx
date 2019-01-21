import React from 'react';
import PropTypes from 'prop-types';
import './EditButton.scss';

export default class EditButton extends React.Component {

    static propTypes = {
        onClick: PropTypes.func.isRequired,
        buttonClassName: PropTypes.string,
    };

    render() {
        return (
            <button
                type="button"
                className={`EditButton btn ${this.props.buttonClassName || ''}`}
                onClick={this.props.onClick}>
                <i className="fa fa-pencil-alt" />
            </button>
        );
    }
}
