import React from "react";
import PropTypes from "prop-types";
import "./Stars.scss";

export default class Stars extends React.PureComponent {

    static propTypes = {
        note: PropTypes.number.isRequired
    };

    render() {

        let note = Math.round(this.props.note);
        let stars = new Array(5).fill("active", 0, note).fill("empty", note, 5);

        return (
            <span className="Stars">
                {
                    stars.map((star, index) => {
                        return <span
                            key={index}
                            className={star === "active" ? "fas fa-star active" : "fas fa-star empty"}
                        />;
                    })
                }
            </span>
        );
    }
}
