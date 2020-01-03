import React, { useContext } from "react";
import PropTypes from "prop-types";
import AppContext from "../../../BackofficeContext";
import "./Page.scss";
import WithAnalytics from "../../../../common/components/analytics/WithAnalytics";

const Page = props => {

    let { account } = useContext(AppContext);
    let profile = account.profile;

    return (
        <div className={`Page mb-0 ${props.className || ""}`}>

            <div className={`search-holder ${profile}`}>

                {props.title &&
                <div className="title-holder">
                    <div className="container">
                        {props.title}
                    </div>
                </div>
                }

                {props.form &&
                <WithAnalytics category="formulaire">
                    <div className="form-holder">
                        <div className="container">
                            {props.form}
                        </div>
                    </div>
                </WithAnalytics>
                }

                {props.tabs &&
                <WithAnalytics category="tabs">
                    <div className="tabs-holder">
                        <div className="container">
                            {props.tabs}
                        </div>
                    </div>
                </WithAnalytics>
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
