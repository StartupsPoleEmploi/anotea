import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import FormError from './FormError';
import './InputText.scss';

export default class InputText extends React.Component {

    static propTypes = {
        id: PropTypes.node,
        icon: PropTypes.node,
        reset: PropTypes.func,
        error: PropTypes.string,
        errorid: PropTypes.string,
        autoComplete: PropTypes.string,
        inputRef: PropTypes.object,
        invalid: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
    }

    render() {
        let { id, icon, reset, error, errorid, inputRef, invalid } = this.props;
        let describedBy = this.props['aria-describedby'];

        return (
            <div className="InputText">
                <div className="d-flex align-items-stretch champ-texte" style={{"height": "49px"}}>

                    {icon &&
                    <div className="icon d-flex align-items-center">
                        {icon}
                    </div>
                    }

                    <input
                        type="text"
                        id={id}
                        autoComplete={this.autoComplete?this.autoComplete:null}
                        className={`${this.icon ? 'with-icon' : ''} ${this.reset ? 'with-reset' : ''} ${this.error ? 'with-error' : ''}`}
                        ref={inputRef || this.inputRef}
                        aria-invalid={error || invalid ? true : undefined}
                        aria-describedby={describedBy ? (error ? (errorid ? `${describedBy} ${errorid}` : `${describedBy} ${id}-error`) : describedBy) : (error ? (errorid ? `${errorid}` : `${id}-error`) : null)}
                        {..._.omit(this.props, ['icon', 'reset', 'error', 'errorid', 'aria-describedby', 'inputRef'])}
                    />

                    {reset &&
                    <div className="reset d-flex align-items-center">
                        <button onClick={reset} className="button-reset"><i className="fas fa-times" /><span className="sr-only">supprimer le filtre</span></button>
                    </div>
                    }
                </div>
                {error &&
                <FormError id={errorid ? errorid : `${id}-error`}>
                    {error}
                </FormError>
                }
            </div>
        );
    }
}
