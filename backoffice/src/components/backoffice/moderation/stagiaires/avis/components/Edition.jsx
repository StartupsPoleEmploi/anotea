import React from 'react';
import PropTypes from 'prop-types';
import PublishButton from './buttons/PublishButton';
import { updateAvis } from '../../../../../../lib/avisService';
import './Edition.scss';

export default class Edition extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.object.isRequired,
        onClose: PropTypes.object.isRequired,
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

                <div className="mt-1 actions">
                    <button type="button" className="action btn btn-sm mr-2 action cancel" onClick={onClose}>
                        <i className={`fa fa-times-circle`} /> Annuler
                    </button>

                    <PublishButton
                        buttonClassName="action publish"
                        avis={avis}
                        onChange={avis => onClose() && onChange(avis)}
                        label="Valider et Publier"
                        beforePublish={this.update}
                    />
                </div>
            </div>
        );
    }
}
