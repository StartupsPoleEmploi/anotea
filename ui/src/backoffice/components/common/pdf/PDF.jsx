import React from "react";
import PropTypes from "prop-types";
import html2canvas from "html2canvas";
import JSPDF from "jspdf";
import logo from "./logo-financeur.png";
import moment from "moment";
import "./PDF.scss";

export const buildPDF = async element => {
    let pdf = new JSPDF("landscape", "px", "a4");

    let canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, "stats", "FAST");

    return pdf.save(`export.pdf`);
};

export default class PDF extends React.Component {

    static propTypes = {
        title: PropTypes.node.isRequired,
        main: PropTypes.node.isRequired,
        summary: PropTypes.node,
        footer: PropTypes.node,
    };

    render() {

        let { title, summary, main, footer } = this.props;
        return (
            <div className="PDF">
                <div className="container">
                    <div className="header">
                        <div className="row align-items-center">
                            <div className="col-sm-3 text-left">
                                <img src={logo} className="logo" alt="logo" width={"50%"} />
                            </div>
                            <div className="title col-sm-6 d-flex justify-content-center">
                                {title}
                            </div>
                            <div className="export col-sm-3 text-right">
                                Données exportées le {moment().format("DD/MM/YYYY")}
                            </div>
                        </div>
                        {summary &&
                        <div className="summary row">
                            <div className="col-sm-12">
                                {summary}
                            </div>
                        </div>
                        }
                    </div>
                    <div className="main">
                        {main}
                    </div>
                    {footer &&
                    <div className="footer">
                        <div className="text-center">
                            {footer}
                        </div>
                    </div>}
                </div>
            </div>
        );
    }
}
