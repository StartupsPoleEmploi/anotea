import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { clearDates, convertIntoDatepicker, setEndDate, setStartDate, updateDatepicker } from './datepicker';
import './Date.scss';

let depths = ['days', 'months'];

export default class Date extends React.Component {

    static propTypes = {
        value: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        pattern: PropTypes.string,
        min: PropTypes.object,
        max: PropTypes.object,
        depth: PropTypes.string,
    };

    static defaultProps = {
        pattern: 'DD/MM/YYYY',
        depth: 'days',
    };

    constructor(props) {
        super(props);
        this.reference = React.createRef();
    }

    formatDate = (date = new Date()) => moment(date).format(this.props.pattern);

    componentDidMount() {
        let { pattern, min, max, depth } = this.props;
        let input = this.reference.current;

        convertIntoDatepicker(input,
            {
                startView: 2,
                maxViewMode: 2,
                minViewMode: depths.findIndex(v => v === depth) || 0,
                autoclose: true,
                language: 'fr',
                format: pattern.toLowerCase(),
                orientation: 'bottom auto',
                startDate: min ? this.formatDate(min) : null,
                endDate: max ? this.formatDate(max) : null,
                onChange: () => {
                    return input.value ? this.props.onChange(moment(`${input.value}-0000`, `${pattern} Z`)) : null;
                },
            });
    }

    componentDidUpdate(previous) {
        let { value, min, max } = this.props;
        let input = this.reference.current;

        if (!value) {
            clearDates(input);
        } else if (value && !moment(value).isSame(previous.value)) {
            updateDatepicker(input, this.formatDate(value));
        }

        if (min && !moment(min).isSame(previous.min)) {
            setStartDate(input, this.formatDate(min));
        }

        if (max && !moment(max).isSame(previous.max)) {
            setEndDate(input, this.formatDate(max));
        }
    }

    render() {
        let { pattern } = this.props;

        return (
            <div className={'Date'}>
                <input ref={this.reference} placeholder={pattern.toLowerCase()} />
            </div>
        );
    }
}
