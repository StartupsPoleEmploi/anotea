import React from 'react';
import PropTypes from 'prop-types';
import { Date } from './Form';
import uuid from 'uuid'; //See https://github.com/gpbl/react-day-picker/issues/886
import './DateRange.scss';


export default class DateRange extends React.Component {

    static propTypes = {
        range: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    onDateChange(type, date) {
        let { range, onChange } = this.props;
        return onChange(Object.assign({}, range, { [type]: date }));
    }

    render() {
        let { range } = this.props;

        return (
            <div className="DateRange">
                <i className="far fa-calendar"></i>
                <Date
                    key={`${range.startDate}${uuid.v4()}`}
                    value={range.startDate}
                    onChange={date => this.onDateChange('startDate', date)}
                    disabledDays={[{ after: range.endDate }]}
                />
                <span className="between">à</span>
                <Date
                    key={`${range.endDate}${uuid.v4()}`}
                    value={range.endDate}
                    onChange={date => this.onDateChange('endDate', date)}
                    disabledDays={[{ before: range.startDate }]}
                />
            </div>
        );
    }
}
