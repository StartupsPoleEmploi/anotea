import React from 'react';

export default class NoteFilter extends React.Component {

    state = {
        starArray: [
            { valeur: 'Pas du tout satisfait', starNumber: 1 },
            { valeur: 'Pas satisfait', starNumber: 2 },
            { valeur: 'Moyennement satisfait', starNumber: 3 },
            { valeur: 'Satisfait', starNumber: 4 },
            { valeur: 'Très satisfait', starNumber: 5 },
        ],
    };

    render() {
        return (
            <div className="NotesFilter">
                <strong>Notes</strong>
                {this.state.starArray.map((star, index) =>
                    <div className="radio" key={index}>
                        <label>
                            <input type="radio" />
                            {star.valeur}
                            <div>
                                {star.starNumber === 1 ?
                                    <i className="glyphicon glyphicon-star"></i> :
                                    (star.starNumber === 2 ?
                                        <div>
                                            <i className="glyphicon glyphicon-star"></i>
                                            <i className="glyphicon glyphicon-star"></i>
                                        </div> :
                                        (star.starNumber === 3 ?
                                            <div>
                                                <i className="glyphicon glyphicon-star"></i>
                                                <i className="glyphicon glyphicon-star"></i>
                                                <i className="glyphicon glyphicon-star"></i>
                                            </div> :
                                            (star.starNumber === 4 ?
                                                <div>
                                                    <i className="glyphicon glyphicon-star"></i>
                                                    <i className="glyphicon glyphicon-star"></i>
                                                    <i className="glyphicon glyphicon-star"></i>
                                                    <i className="glyphicon glyphicon-star"></i>

                                                </div> :
                                                <div>
                                                    <i className="glyphicon glyphicon-star"></i>
                                                    <i className="glyphicon glyphicon-star"></i>
                                                    <i className="glyphicon glyphicon-star"></i>
                                                    <i className="glyphicon glyphicon-star"></i>
                                                    <i className="glyphicon glyphicon-star"></i>

                                                </div>
                                            )
                                        )
                                    )
                                }
                            </div>
                        </label>
                    </div>
                )}
            </div>
        );
    }

}
