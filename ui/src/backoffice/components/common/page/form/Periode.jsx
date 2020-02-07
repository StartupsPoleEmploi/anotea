import React from 'react';
import PropTypes from 'prop-types';
import Date from './date/Date';
import './Periode.scss';
import AnalyticsContext from '../../../../../common/components/analytics/AnalyticsContext';

export default class Periode extends React.Component {

    static contextType = AnalyticsContext;

    static propTypes = {
        periode: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        min: PropTypes.object,
        max: PropTypes.object,
        depth: PropTypes.string,
    };

    onDateChange(type, date) {
        let { trackClick } = this.context;
        let { periode, onChange } = this.props;

        trackClick('periode');
        return onChange(Object.assign({}, periode, { [type]: date }));
    }

    onReset() {
        return this.props.onChange({ debut: null, fin: null });
    }

    render() {
        let { periode, min, max, depth } = this.props;

        return (
            <div className="Periode d-flex justify-content-around align-items-center">
                <i className="fas fa-map-marker-alt pl-1"></i>
                <Date
                    value={periode.debut}
                    min={min}
                    max={max}
                    depth={depth || 'days'}
                    onChange={date => this.onDateChange('debut', date)}
                />
                <span className="au">à</span>
                <Date
                    value={periode.fin}
                    min={periode.debut || min}
                    depth={depth || 'days'}
                    onChange={date => this.onDateChange('fin', date)}
                />
                <span className="clear" onClick={() => this.onReset()}>
                    <svg
                        height="20"
                        width="20"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        focusable="false"
                        className="css-tj5bde-Svg">
                        <path
                            d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
                    </svg>
                </span>
            </div>
        );
    }
}
