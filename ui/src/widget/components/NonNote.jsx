import React, { Component } from "react"
import './NonNote.scss';

export class NonNote extends Component {



    render() {
        return (
            <div class="NonNote d-flex justify-content-center mb-3">
                <div class="d-flex flex-column text-center">
                    <div>
                        <span class="note">Non noté</span>
                        <span class="star fas fa-star"></span>
                    </div>
                    <div class="message">Aucun avis n’a encore été déposé sur cette formation</div>
                </div>
            </div>
        );
    }

}