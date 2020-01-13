import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ReactSelect, { components } from 'react-windowed-select';
import CreatableSelect from 'react-select/creatable';
import AnalyticsContext from '../../../../../common/components/analytics/AnalyticsContext';
import './Select.scss';

const Option = props => {
    let { label, meta } = props.data;
    return (
        <components.Option {...props}>
            <div className="d-flex justify-content-between">
                <div className={`Select__label ${meta ? 'Select__label--with-meta' : ''}`}>{label}</div>
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
        value: PropTypes.any,
        options: PropTypes.array.isRequired,
        optionKey: PropTypes.string,
        label: PropTypes.func,
        meta: PropTypes.func,
        onChange: PropTypes.func.isRequired,
        placeholder: PropTypes.string.isRequired,
        loading: PropTypes.bool,
        type: PropTypes.string,
        trackingId: PropTypes.string,
    };

    static defaultProps = {
        type: 'search',
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

        let creatable = this.props.type === 'create';
        let SelectType = creatable ? CreatableSelect : ReactSelect;

        return (
            <SelectType
                className="Select"
                classNamePrefix="Select"
                isLoading={this.props.loading}
                components={{ Option }}
                value={_.isEmpty(this.props.value) ? null : this.toReactSelectOption(this.props.value)}
                options={this.props.options.map(o => this.toReactSelectOption(o))}
                placeholder={this.props.options.length === 0 ? '' : this.props.placeholder}
                isClearable
                onChange={option => {

                    trackClick(this.props.trackingId || 'select');

                    if (!option) {
                        return this.props.onChange(null);
                    }

                    let data = this.props.options.find(o => {
                        let key = this.props.optionKey ? o[this.props.optionKey] : o;
                        return key === option.value;
                    });

                    return this.props.onChange(data);
                }}
                {
                    ...(creatable ? {
                        autoFocus: true,
                        openMenuOnFocus: true,
                        formatCreateLabel: label => `Ajouter "${label}"`,
                        createOptionPosition: 'first',
                        onCreateOption: option => {
                            let data = this.props.optionKey ? { [this.props.optionKey]: option } : option;
                            return this.props.onChange(data);
                        }
                    } : {
                        isSearchable: true
                    })
                }
            />
        );
    }
}

