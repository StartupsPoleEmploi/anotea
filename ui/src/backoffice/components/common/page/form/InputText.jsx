import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import FormError from "./FormError";
import "./InputText.scss";

export default class InputText extends React.Component {

    static propTypes = {
        icon: PropTypes.node,
        reset: PropTypes.func,
        error: PropTypes.string,
    };

    render() {
        let { icon, reset, error } = this.props;

        return (
            <div className="InputText">
                <div className="d-flex align-items-stretch">

                    {icon &&
                    <div className="icon d-flex align-items-center">
                        {icon}
                    </div>
                    }

                    <input
                        type="text"
                        className={`${icon ? "with-icon" : ""} ${reset ? "with-reset" : ""} ${error ? "with-error" : ""}`}
                        {..._.omit(this.props, ["icon", "reset", "error"])}
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
