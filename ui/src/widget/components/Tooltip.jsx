import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Tooltip.scss';
import _uniqueId from 'lodash/uniqueId';

export default class Tooltip extends Component {

    constructor(props){
        super(props);
        this.escFunction = this.escFunction.bind(this);
        this.id = _uniqueId("tooltip-");
    }

    static propTypes = {
        message: PropTypes.node.isRequired,
    };

    state = {
        show: false,
        showOnTooltip: false,
    };

    show = () => {
        return this.setState({ show: true });
    };

    hide = () => {
        return setTimeout(() => {
            this.setState({ show: false });
        }, 300);
    };

    showOnTooltip = () => {
        return this.setState({ showOnTooltip: true });
    };

    hideOnTooltip = () => {
        return setTimeout(() => {
            this.setState({ showOnTooltip: false });
        }, 300);
    };

    escFunction(event){
      if(event.keyCode === 27) {
        this.hide();
      }
    }
    componentDidMount(){
      document.addEventListener("keydown", this.escFunction, false);
    }
    componentWillUnmount(){
      document.removeEventListener("keydown", this.escFunction, false);
    }

    render() {
        const id = this.id;

        let { message } = this.props;

        return (
            <div className="Tooltip">
                <div
                    className="icon"
                    onMouseEnter={() => this.show()}
                    onMouseLeave={() => this.hide()}
                    onFocus={() => this.show()}
                    onBlur={() => this.hide()}
                    tabIndex="0"
                    aria-describedby={id}
                >
                    <i className="far fa-question-circle" aria-hidden="true"></i>
                    <p className="sr-only">{message}</p>
                </div>
                {(this.state.show || this.state.showOnTooltip) &&
                <div className="box" role="tooltip"
                    onMouseEnter={() => this.showOnTooltip()}
                    onMouseLeave={() => this.hideOnTooltip()}
                    id={id}>
                    <p className="message" aria-hidden="true">{message}</p>
                </div>
                }
            </div>
        );
    }
}
