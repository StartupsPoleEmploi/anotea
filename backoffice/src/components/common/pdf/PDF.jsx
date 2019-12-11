import React from 'react';
import PropTypes from 'prop-types';
import Panel from '../page/panel/Panel';
import logo from './logo-financeur.png';
import moment from 'moment';
import './PDF.scss';

export default class PDF extends React.Component {

    static propTypes = {
        title: PropTypes.node.isRequired,
        summary: PropTypes.node.isRequired,
        results: PropTypes.object.isRequired,
    };

    render() {

        let { title, summary, results } = this.props;

        return (
            <Panel
                className={`PDF`}
                summary={
                    <>
                        <div className="row align-items-center">
                            <div className="col-sm-3 text-left">
                                <img src={logo} className="logo" alt="logo" width={'50%'} />
                            </div>
                            <div className="title col-sm-6 d-flex justify-content-center">
                                {title}
                            </div>
                            <div className="export col-sm-3 text-right">
                                Données exportées le {moment().format('DD/MM/YYYY')}
                            </div>
                        </div>
                        <div className="summary row">
                            <div className="col-sm-12">
                                {summary}
                            </div>
                        </div>
                    </>
                }
                results={results}
            />
        );

    }

}
