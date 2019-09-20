import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import UserContext from '../../../UserContext';
import './Page.scss';

const Page = props => {

    let user = useContext(UserContext);
    let profile = user.profile;

    return (
        <div className={`Page mb-0 ${props.className || ''}`}>

            <div className={`holder ${profile}`}>

                {props.title &&
                <div className="title-holder">
                    <div className="container">
                        {props.title}
                    </div>
                </div>
                }

                {props.form &&
                <div className="form-holder">
                    <div className="container">
                        {props.form}
                    </div>
                </div>
                }

                {props.tabs &&
                <div className="tabs-holder">
                    <div className="container">
                        {props.tabs}
                    </div>
                </div>
                }
            </div>

            <div className="panel-holder">
                {props.panel}
            </div>
        </div>
    );
};

Page.propTypes = {
    title: PropTypes.node,
    form: PropTypes.node,
    tabs: PropTypes.node,
    panel: PropTypes.node,
    className: PropTypes.string,
};

export default Page;
