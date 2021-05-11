import React, { Component } from "react";
import './NonNote.scss';

export class NonNote extends Component {



    render() {
        return (
            <div className="NonNote d-flex justify-content-center mb-3">
                <div className="d-flex flex-column text-center">
                    <div>
                        <span className="note">Non noté</span>
                        <span className="star fas fa-star"></span>
                    </div>
                    <div className="message">Aucun avis n’a encore été déposé sur cette formation</div>
                </div>
            </div>
        );
    }

}