import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import { registerLocale, setDefaultLocale } from  "react-datepicker";
import fr from 'date-fns/locale/fr';
import './PeriodeFilter.scss';

import 'react-datepicker/dist/react-datepicker.css';

registerLocale('fr', fr);

const pStyle = {
    'padding': '0px',
    'margin': '0px',
    'color': '#24303A',
    'fontFamily': 'Lato',
    'fontSize': '18px',
    'fontWeight': 'bold',
    'lineHeight': '22px',
};

export default class PeriodeFilter extends React.Component {

    static propTypes = {
        label: PropTypes.string.isRequired,
        placeholderText: PropTypes.string.isRequired,
        oldestAvis: PropTypes.string.isRequired,
        startDate: PropTypes.instanceOf(Date),
        endDate: PropTypes.instanceOf(Date),
        onChangeStartDate: PropTypes.func.isRequired,
        onChangeEndDate: PropTypes.func.isRequired,
        onClearDates: PropTypes.func.isRequired,
    };

    handleChangeStart = date => {
        this.props.onChangeStartDate(date);
    }

    handleChangeEnd = date => {
        this.props.onChangeEndDate(date);
    }

    render() {
        
        return (
            <div>
                <p style={pStyle}>{this.props.label}</p>
                <div className="datepicker-container">
                    <DatePicker
                        showYearDropdown
                        scrollableYearDropdown
                        openToDate={new Date(this.props.oldestAvis)}
                        dateFormat="dd/MM/yyyy"
                        selectsStart
                        selected={this.props.startDate}
                        onChange={this.handleChangeStart}
                        placeholderText={this.props.placeholderText}
                        minDate={new Date(this.props.oldestAvis)}
                        maxDate={this.props.endDate}
                        locale="fr"
                    />
                    {'à '}
                    <DatePicker
                        showYearDropdown
                        scrollableYearDropdown
                        openToDate={this.props.startDate}
                        dateFormat="dd/MM/yyyy"
                        selectsEnd
                        selected={this.props.endDate}
                        onChange={this.handleChangeEnd}
                        placeholderText={this.props.placeholderText}
                        disabled={!this.props.startDate && true}
                        minDate={this.props.startDate}
                        locale="fr"
                    />
                    {this.props.startDate &&
                        <i className="fas fa-times-circle" onClick={this.props.onClearDates} />
                    }
                </div>
            </div>
        );
    }
}
