import React from 'react';
import PropTypes from 'prop-types';
import { maskTitle } from '../../moderationService';
import './Titre.scss';

export default class Titre extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        readonly: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    };


    toggle = async () => {
        let avis = this.props.avis;
        let updated = await maskTitle(avis._id, !avis.titleMasked);
        this.props.onChange(updated);
    };

    render() {
        let { avis, readonly } = this.props;

        if (!avis.comment || !avis.comment.title) {
            return <div className="Titre empty">Aucun titre</div>;
        }
        return (
            <div className="Titre">
                <span className={`mr-1 title ${avis.titleMasked ? 'masked' : ''}`}>{avis.comment.title}</span>
                {!readonly &&
                <i className={`far ${avis.titleMasked ? 'fa-eye' : 'fa-eye-slash'} toggable`} onClick={this.toggle} />
                }
            </div>
        );
    }
}
