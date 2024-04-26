import React from 'react';
import PropTypes from 'prop-types';
import { Form } from './Form';
import './CenteredForm.scss';

export const CenteredForm = props => {
    return (
        <div className="CenteredForm row">
            <div className="offset-sm-2 col-sm-8 offset-lg-4 col-lg-4">
                <Form>
                    <div className="d-flex flex-column">
                        <h2 className="d-flex justify-content-center title mb-3">
                            {props.title}
                        </h2>
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

CenteredForm.propTypes = {
    title: PropTypes.node.isRequired,
    elements: PropTypes.node.isRequired,
    buttons: PropTypes.node.isRequired,
};
