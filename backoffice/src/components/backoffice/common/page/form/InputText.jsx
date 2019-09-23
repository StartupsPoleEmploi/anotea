import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import './InputText.scss';

export default class InputText extends React.Component {

    static propTypes = {
        icon: PropTypes.node,
        reset: PropTypes.func,
    };

    render() {
        let { icon, reset } = this.props;

        return (
            <div className="InputText d-flex align-items-stretch h-100">

                {icon &&
                <div className="icon d-flex align-items-center">
                    {icon}
                </div>
                }

                <input
                    type="text"
                    className={`form-control ${icon ? 'with-icon' : ''} ${reset ? 'with-reset' : ''} h-100`}
                    {..._.omit(this.props, ['icon', 'reset'])}
                />

                {reset &&
                <div className="reset d-flex align-items-center">
                    <span onClick={reset}><i className="fas fa-times" /></span>
                </div>
                }
            </div>
        );
    }
}
