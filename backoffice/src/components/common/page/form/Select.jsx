import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ReactSelect, { components } from 'react-windowed-select';
import './Select.scss';
import AnalyticsContext from '../../../analytics/AnalyticsContext';

const Option = props => {
    let meta = props.data.meta;
    return (
        <components.Option {...props}>
            <div className="d-flex justify-content-between">
                <div className={`Select__label ${meta ? 'Select__label--with-meta' : ''}`}>{props.data.label}</div>
                {meta &&
                <div className="Select__meta">{meta}</div>
                }
            </div>
        </components.Option>
    );
};

Option.propTypes = {
    data: PropTypes.object.isRequired,
};

export default class Select extends React.Component {

    static contextType = AnalyticsContext;

    static propTypes = {
        value: PropTypes.object,
        options: PropTypes.array.isRequired,
        optionKey: PropTypes.string.isRequired,
        label: PropTypes.func.isRequired,
        meta: PropTypes.func,
        onChange: PropTypes.func.isRequired,
        placeholder: PropTypes.string,
        loading: PropTypes.bool,
        isClearable: PropTypes.bool,
        trackingId: PropTypes.string,
    };

    static defaultProps = {
        optionKey: 'value',
        isClearable: true
    };

    toReactSelectOption = option => {
        let keyPropertyName = this.props.optionKey;

        return {
            value: option[keyPropertyName],
            ...(this.props.label ? { label: this.props.label(option) } : {}),
            ...(this.props.meta ? { meta: this.props.meta(option) } : {}),
        };
    };

    constructor(props) {
        super();
    }

    render() {
        let { value, placeholder, options, onChange, loading, optionKey, isClearable, trackingId } = this.props;
        let { trackClick } = this.context;
        let keyPropertyName = optionKey;

        return (
            <ReactSelect
                className={`Select`}
                classNamePrefix="Select"
                isLoading={loading}
                components={{ Option }}
                isClearable={isClearable}
                isSearchable
                value={_.isEmpty(value) ? null : this.toReactSelectOption(value)}
                options={options.map(o => this.toReactSelectOption(o))}
                placeholder={options.length === 0 ? '' : placeholder}
                onChange={option => {
                    trackClick(trackingId || 'select');
                    if (!option) {
                        return onChange(null);
                    }
                    return onChange(options.find(o => o[keyPropertyName] === option.value));
                }}
            />
        );
    }
}

