import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import './Button.scss';
import Tooltip from './Tooltip';
import AnalyticsContext from '../analytics/AnalyticsContext';

export default class Button extends React.Component {

    static contextType = AnalyticsContext;

    static propTypes = {
        size: PropTypes.string.isRequired,
        color: PropTypes.string,
        type: PropTypes.string,
        disabled: PropTypes.bool,
        toggable: PropTypes.bool,
        style: PropTypes.object,
        onClick: PropTypes.func,
        className: PropTypes.string,
        tooltip: PropTypes.string,
        children: PropTypes.node,
    };

    constructor(props) {
        super(props);
        this.state = {
            showTransition: false,
        };
        this.reference = React.createRef();
    }

    render() {
        let { trackClick } = this.context;
        let sizeClass = `a-btn-${this.props.size}`;
        let colorClass = this.props.color ? `a-btn-${this.props.color}` : '';
        let disabledClass = this.props.disabled ? 'a-btn-disabled' : '';
        let toggableClass = this.props.toggable ? 'dropdown-toggle' : '';
        let tooltipClass = this.props.tooltip ? 'Tooltip--holder' : '';
        let classes = `${sizeClass} ${colorClass} ${disabledClass} ${toggableClass} ${tooltipClass} ${this.props.className || ''}`;
        let noop = () => ({});

        let ref = this.reference;
        return (
            <button
                ref={ref}
                type={this.props.type || 'button'}
                style={this.props.style || {}}
                className={`Button ${classes}`}
                disabled={this.props.disabled}
                {...(this.props.toggable ? { 'data-toggle': 'dropdown' } : {})}
                {..._.omit(this.props, ['size', 'color', 'toggable', 'className', 'onClick'])}
                onClick={!this.props.onClick ? noop : e => {
                    trackClick(ref.current.textContent);
                    this.props.onClick(e);
                    if (this.props.type === 'submit') {
                        e.preventDefault();
                    }
                }}
            >
                {this.props.tooltip &&
                <Tooltip value={this.props.tooltip} />
                }
                {this.props.children}
            </button>
        );
    }
}
