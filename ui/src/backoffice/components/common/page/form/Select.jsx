import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ReactSelect, { components } from 'react-windowed-select';
import './Select.scss';
import AnalyticsContext from '../../../../../common/components/analytics/AnalyticsContext';

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
        value: PropTypes.node,
        options: PropTypes.array.isRequired,
        optionKey: PropTypes.string,
        label: PropTypes.func,
        meta: PropTypes.func,
        onChange: PropTypes.func.isRequired,
        placeholder: PropTypes.string.isRequired,
        loading: PropTypes.bool,
        isClearable: PropTypes.bool,
        isSearchable: PropTypes.bool,
        trackingId: PropTypes.string,
    };

    static defaultProps = {
        isSearchable: true,
        isClearable: true,
    };

    toReactSelectOption = option => {
        let { optionKey } = this.props;
        let value = optionKey ? option[optionKey] : option;

        return {
            value,
            ...(this.props.label ? { label: this.props.label(option) } : { label: value }),
            ...(this.props.meta ? { meta: this.props.meta(option) } : {}),
        };
    };

    render() {
        let { trackClick } = this.context;
        let { value, placeholder, options, onChange, loading, optionKey, trackingId, isClearable, isSearchable } = this.props;

        return (
            <ReactSelect
                className="Select"
                classNamePrefix="Select"
                isLoading={loading}
                components={{ Option }}
                isClearable={isClearable}
                isSearchable={isSearchable}
                value={_.isEmpty(value) ? null : this.toReactSelectOption(value)}
                options={options.map(o => this.toReactSelectOption(o))}
                placeholder={options.length === 0 ? '' : placeholder}
                onChange={option => {
                    trackClick(trackingId || 'select');
                    if (!option) {
                        return onChange(null);
                    }

                    return onChange(options.find(o => {
                        let key = optionKey ? o[optionKey] : o;
                        return key === option.value;
                    }));
                }}
            />
        );
    }
}

