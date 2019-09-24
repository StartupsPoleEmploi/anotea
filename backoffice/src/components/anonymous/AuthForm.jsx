import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '../backoffice/common/page/form/Form';
import './AuthForm.scss';

export const AuthForm = props => {
    return (
        <div className="AuthForm row">
            <div className="offset-sm-2 col-sm-8 offset-lg-4 col-lg-4">
                <Form>
                    <div className="d-flex flex-column">
                        <div className="d-flex justify-content-center title mb-3">
                            {props.title}
                        </div>
                        {props.elements}
                        <div className="d-flex justify-content-around mt-3">
                            {props.buttons}
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
};

AuthForm.propTypes = {
    title: PropTypes.string.isRequired,
    elements: PropTypes.node.isRequired,
    buttons: PropTypes.node.isRequired,
};
