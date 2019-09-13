import React from 'react';
import PropTypes from 'prop-types';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import './Date.scss';
import { formatDate, parseDate } from 'react-day-picker/moment';
import 'moment/locale/it';

const MONTHS = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
];

const WEEKDAYS_LONG = [
    'Dimanche',
    'Lundi',
    'Mardi',
    'Mecredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
];

export default class Date extends React.Component {

    static propTypes = {
        value: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        disabledDays: PropTypes.array,
    };

    render() {
        let { value, onChange, disabledDays } = this.props;

        return (
            <span className="Date">
                <DayPickerInput
                    value={value || ''}
                    onDayChange={onChange}
                    dayPickerProps={{
                        locale: 'fr',
                        weekdaysShort: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
                        weekdaysLong: WEEKDAYS_LONG,
                        months: MONTHS,
                        firstDayOfWeek: 1,
                        labels: { nextMonth: 'Mois suivant', previousMonth: 'Mois précédent' },
                        disabledDays: disabledDays,
                    }}
                    formatDate={formatDate}
                    parseDate={parseDate}
                    placeholder={value ? `${formatDate(new Date())}` : 'dd/mm/yyyy'}
                />
            </span>
        );
    }
}
