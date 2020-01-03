import React from "react";
import "./GridDisplayer.scss";

const GridDisplayer = () => {

    return (
        <div className="GridDisplayer">
            <div className="container">
                <div className="row">
                    <div className="col-1">
                        <div className="d-block d-sm-none"><span>xs</span></div>
                        <div className="d-none d-sm-block d-md-none"><span>sm</span></div>
                        <div className="d-none d-md-block d-lg-none"><span>md</span></div>
                        <div className="d-none d-lg-block d-xl-none"><span>lg</span></div>
                        <div className="d-none d-xl-block"><span>xl</span></div>
                    </div>
                    <div className="col-1"><span></span></div>
                    <div className="col-1"><span></span></div>
                    <div className="col-1"><span></span></div>
                    <div className="col-1"><span></span></div>
                    <div className="col-1"><span></span></div>
                    <div className="col-1"><span></span></div>
                    <div className="col-1"><span></span></div>
                    <div className="col-1"><span></span></div>
                    <div className="col-1"><span></span></div>
                    <div className="col-1"><span></span></div>
                    <div className="col-1"><span></span></div>
                </div>
            </div>
        </div>
    );
};

export default GridDisplayer;
