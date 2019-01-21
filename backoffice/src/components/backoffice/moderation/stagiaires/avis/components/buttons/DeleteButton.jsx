import React from 'react';
import PropTypes from 'prop-types';
import { deleteAvis } from '../../../../../../../lib/avisService';
import './DeleteButton.scss';

export default class DeleteButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    handleDelete = async () => {
        await deleteAvis(this.props.avis._id);
        this.props.onChange(this.props.avis);
    };

    render() {
        return (
            <button
                type="button"
                className={`DeleteButton`}
                onClick={this.handleDelete}>
                <i className="far fa-trash-alt icon" /> <span className="strong">Supprimer</span>
            </button>
        );
    }
}
