import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Tooltip.scss';

export default class Tooltip extends Component {

    constructor(props){
        super(props);
        this.escFunction = this.escFunction.bind(this);
    }

    static propTypes = {
        message: PropTypes.node.isRequired,
    };

    state = {
        show: false,
    };

    show = () => {
        return this.setState({ show: true });
    };

    hide = () => {
        return this.setState({ show: false });
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

        let { message } = this.props;

        return (
            <div className="Tooltip">
                <span
                    className="icon"
                    onMouseEnter={() => this.show()}
                    onMouseLeave={() => this.hide()}
                    onFocus={() => this.show()}
                    onBlur={() => this.hide()}
                    tabIndex="0"
                >&nbsp;
                    <i className="far fa-question-circle"></i>
                </span>
                {this.state.show &&
                <div className="box">
                    <div className="message">{message}</div>
                </div>
                }
            </div>
        );
    }
}
