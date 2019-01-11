import React from 'react';
import PropTypes from 'prop-types';
import './Button.scss';

export default class EditButton extends React.Component {

    static propTypes = {
        onClick: PropTypes.func.isRequired,
        buttonClassName: PropTypes.string.isRequired,
    };

    render() {
        let { onClick } = this.props;

        return (
            <button
                type="button"
                className={`EditButton Button btn btn-sm btn-primary ${this.props.buttonClassName}`}
                onClick={onClick}>
                <i className="fa fa-pencil-alt" />
            </button>
        );
    }
}
