import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Stars from './Stars';
import './note.scss';

class Note extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        parity: PropTypes.string.isRequired,
        onSelect: PropTypes.func.isRequired,
        index: PropTypes.number.isRequired,
        value: PropTypes.number
    };

    render() {
        let hideClass = this.props.value ? 'd-none d-sm-block' : '';
        return (
            <div className={`note ${this.props.parity}`}>
                <div className={`row inner-row align-items-center`}>
                    <div className="col-sm-7">
                        <div className="title">{this.props.title}</div>
                        <div className={`description ${hideClass}`}>{this.props.description}</div>
                    </div>
                    <div className="col-sm-5 stars-container d-flex justify-content-start justify-content-sm-end">
                        <Stars onSelect={this.props.onSelect} index={this.props.index} value={this.props.value} />
                    </div>
                </div>
            </div>
        );
    }
}

export default Note;
