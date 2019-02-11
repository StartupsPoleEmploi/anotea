import React from 'react';
import PropTypes from 'prop-types';
import { maskTitle } from '../../../../../../lib/avisService';
import './Titre.scss';

export default class Titre extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        disabled: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    };


    toggle = async () => {
        let avis = this.props.avis;
        let updated = await maskTitle(avis._id, !avis.titleMasked);
        this.props.onChange(updated);
    };

    render() {
        let { avis, disabled } = this.props;

        if (!avis.comment || !avis.comment.title) {
            return <div className="Titre empty">Aucun titre</div>;
        }
        return (
            <div className="Titre">
                <span className={`mr-1 title ${avis.titleMasked ? 'masked' : ''}`}>{avis.comment.title}</span>
                {!disabled &&
                <i className={`far ${avis.titleMasked ? 'fa-eye' : 'fa-eye-slash'} toggable`} onClick={this.toggle} />
                }
            </div>
        );
    }
}
