import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ReactSelect from 'react-windowed-select';
import './Select.scss';

export default class Select extends React.Component {

    static propTypes = {
        value: PropTypes.object,
        options: PropTypes.array.isRequired,
        optionKey: PropTypes.string.isRequired,
        optionLabel: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        placeholder: PropTypes.string.isRequired,
        loading: PropTypes.bool,
    };

    render() {
        let { value, placeholder, options, onChange, optionKey, optionLabel, loading } = this.props;

        let keyPropertyName = optionKey || 'value';
        let labelPropertyName = optionLabel || 'label';
        let opts = options.map(option => {
            return ({ value: option[keyPropertyName], label: option[labelPropertyName] });
        });

        return (
            <ReactSelect
                className={`Select`}
                classNamePrefix="Select"
                isLoading={loading}
                isClearable
                isSearchable
                value={_.isEmpty(value) ? null : { value: value[keyPropertyName], label: value[labelPropertyName] }}
                placeholder={options.length === 0 ? '' : placeholder}
                options={opts}
                onChange={option => {
                    if (!option) {
                        return onChange(null);
                    }
                    return onChange({ [keyPropertyName]: option.value, [labelPropertyName]: option.label });
                }}
            />
        );
    }
}
