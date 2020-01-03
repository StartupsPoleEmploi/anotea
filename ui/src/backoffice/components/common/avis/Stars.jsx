import React from "react";
import PropTypes from "prop-types";
import "./Stars.scss";

const Stars = props => {

    let isDecimalsNumber = props.note % 1 !== 0;
    let note = props.note;
    let stars = new Array(5).fill("active", 0, Math.ceil(note)).fill("empty", Math.ceil(note), 5);

    return (
        <span>
            {
                stars.map((star, index) => {
                    let starClass = (isDecimalsNumber && Math.ceil(note) === index + 1 && index <= note) ? "fa-star-half-alt" : "fa-star";
                    return <span
                        key={index}
                        className={star === "active" ? `Stars fa ${starClass} active` : "Stars fa fa-star empty"}
                    />;
                })
            }
        </span>
    );
};
Stars.propTypes = { note: PropTypes.number.isRequired };

export default Stars;
