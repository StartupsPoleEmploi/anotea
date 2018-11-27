import React from 'react';

import Stars from '../common/Stars';

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
                                <Stars value={star.starNumber} style={{ display: 'inline' }} />
                            </div>
                        </label>
                    </div>
                )}
            </div>
        );
    }

}
