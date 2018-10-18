import React from 'react';

export const Stars = props => {

    const max = 5;

    let rate = Math.round(props.value);

    let starArray = null;
    if (props.value != null) {
        starArray = new Array(max).fill('glyphicon glyphicon-star', 0, rate).fill('glyphicon glyphicon-star-empty', rate, max);
    }

    return (
        <div className="Stars">
            {starArray && starArray.map((star, index) =>
                <i key={index} className={star}></i>
            )}
            {starArray === null && <span className="invalid">Note invalide</span>}
        </div>
    );
};
