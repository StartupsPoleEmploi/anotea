import React from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";

export default function Link({ children, url, className }) {
    return (
        <NavLink
            to={url}
            isActive={(match, location) => {
                //Ignore parameters when comparing the current location with the link url
                let baseUrl = url.indexOf("?") === -1 ? url : url.split("?")[0];
                return location.pathname.indexOf(baseUrl) !== -1;
            }}
            className={className}
            activeClassName="active">
            {children}
        </NavLink>
    );
}

Link.propTypes = {
    children: PropTypes.node,
    url: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,
};
