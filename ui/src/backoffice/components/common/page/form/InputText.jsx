import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import FormError from './FormError';
import './InputText.scss';

export default class InputText extends React.Component {

    static propTypes = {
        icon: PropTypes.node,
        reset: PropTypes.func,
        error: PropTypes.string,
        autoComplete: PropTypes.string,
        inputRef: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
    }

    render() {
        let { icon, reset, error, inputRef } = this.props;

        return (
            <div className="InputText">
                <div className="d-flex align-items-stretch champ-texte">

                    {icon &&
                    <div className="icon d-flex align-items-center">
                        {icon}
                    </div>
                    }

                    <input
                        type="text"
                        autocomplete={this.autoComplete?this.autoComplete:null}
                        className={`${this.icon ? 'with-icon' : ''} ${this.reset ? 'with-reset' : ''} ${this.error ? 'with-error' : ''}`}
                        ref={inputRef || this.inputRef}
                        {..._.omit(this.props, ['icon', 'reset', 'error'])}
                    />

                    {reset &&
                    <div className="reset d-flex align-items-center">
                        <span onClick={reset}><i className="fas fa-times" /></span>
                    </div>
                    }
                </div>
                {error &&
                <FormError>
                    {error}
                </FormError>
                }
            </div>
        );
    }
}
