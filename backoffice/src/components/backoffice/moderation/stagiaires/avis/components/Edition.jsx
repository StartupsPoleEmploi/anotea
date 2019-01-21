import React from 'react';
import PropTypes from 'prop-types';
import PublishButton from './buttons/PublishButton';
import { updateAvis } from '../../../../../../lib/avisService';
import './Edition.scss';

export default class Edition extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        let avis = this.props.avis;
        this.state = {
            text: avis.editedComment ? avis.editedComment.text : avis.comment.text,
        };
    }

    update = async (avis, qualification) => {
        return updateAvis(avis._id, this.state.text, qualification);
    };

    render() {
        let { avis, onClose, onChange } = this.props;

        return (
            <div className="Edition">
                <textarea
                    className="form-control"
                    rows="3"
                    onChange={e => this.setState({ text: e.target.value })}
                    value={this.state.text} />

                <div className="mt-1 pt-0 d-flex justify-content-end">
                    <button type="button" className="cancel" onClick={onClose}>
                        <i className={`far fa-times-circle`} /> Annuler
                    </button>

                    <PublishButton
                        avis={avis}
                        onChange={avis => onClose() && onChange(avis)}
                        label="Valider et Publier"
                        buttonClassName="publish"
                        beforePublish={this.update}
                    />
                </div>
            </div>
        );
    }
}
