import React, { Component } from "react";
import Verified from '../components/Verified';
import Propulsed from '../components/Propulsed';
import Header from '../components/Header';
import { NonNote } from "./NonNote";


export default class SansAvis extends Component {


    render() {
        return (
            <div>
                <div className="row my-3">
                    <div className="col-12">
                        <Header />
                        <Verified />
                    </div>
                </div>

                <div className="row my-3 justify-content-center">
                    <NonNote />
                </div>


                <div className="row my-3">
                    <div className="col-12 text-center">
                        <Propulsed />
                    </div>
                </div>
            </div>
        );
    }

}