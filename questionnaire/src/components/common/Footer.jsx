import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './footer.scss';

class Footer extends Component {

    static propTypes = {
        children: PropTypes.node
    };

    render() {

        let { children } = this.props;

        return (
            <div className="footer container">
                <div className="row mb-4">
                    <div className="col-sm-12 offset-lg-2 col-lg-8">
                        <div className="d-flex justify-content-center">
                            <span className="propulsed">Service propulsé par</span>
                        </div>
                    </div>
                </div>
                <div className="row align-items-center">
                    <div className={`col-sm-${children ? '2' : '3'} offset-lg-${children ? '2' : '3'}`}>
                        <img
                            className="logo"
                            src={`${process.env.PUBLIC_URL}/images/logo.png`}
                            alt="logo Anotéa" />
                    </div>
                    <div className={`col-sm-${children ? '2' : '3'}`}>
                        <img className="logo-pe" src={`/img/poleemploi.png`} alt="logo Pôle Emploi" />
                    </div>
                    {!!children &&
                    <div className="col-sm-2">
                        {children}
                    </div>
                    }
                </div>
            </div>
        );
    }
}

export default Footer;
