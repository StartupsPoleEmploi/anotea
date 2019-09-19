import React from 'react';
import PropTypes from 'prop-types';
import './Page.scss';

const Page = props => {

    let color = props.color || 'green';

    return (
        <div className={`Page mb-0 ${props.className || ''}`}>

            {props.form &&
            <div className={`form ${color}`}>
                <div className="container">
                    <div className="form-holder">
                        {props.form}
                    </div>
                </div>
            </div>
            }

            {props.tabs &&
            <div className={`tabs ${props.color}`}>
                <div className="container">
                    {props.tabs}
                </div>
            </div>
            }

            <div className={`panel`}>
                {props.panel}
            </div>
        </div>
    );
};

Page.propTypes = {
    form: PropTypes.node,
    tabs: PropTypes.node,
    panel: PropTypes.node,
    className: PropTypes.string,
    color: PropTypes.string,
};

export default Page;
