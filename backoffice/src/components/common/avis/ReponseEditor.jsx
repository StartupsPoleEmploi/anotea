import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { addReponse } from '../../../services/avisService';
import Button from '../Button';
import './ReponseEditor.scss';

export default class ReponseEditor extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.reference = React.createRef();
        this.state = {
            text: _.get(this.props.avis, 'reponse.text', ''),
        };
    }

    componentDidMount() {
        let textarea = this.reference.current;
        textarea.focus();
        textarea.selectionEnd = this.state.text.length;
    }

    sendReponse = async () => {
        let updated = await addReponse(this.props.avis._id, this.state.text);
        this.props.onClose();
        this.props.onChange(updated, {
            message: {
                type: 'local',
                text: <span>La réponse a été enregistrée.</span>,
                timeout: 2500,
            },
        });
    };

    render() {
        return (
            <div className="ReponseEditor">

                <div className="title">
                    <span>Réponse de l&apos;organisme </span>
                </div>

                <textarea
                    ref={this.reference}
                    className="form-control"
                    rows="5"
                    maxLength={300}
                    onChange={e => this.setState({ text: e.target.value })}
                    value={this.state.text} />

                <div className="py-2 text-right">
                    <Button size="small" color="red" className="mr-2" onClick={this.props.onClose}>
                        Annuler
                    </Button>

                    <Button size="medium" color="blue" onClick={() => this.sendReponse()}>
                        Valider
                    </Button>
                </div>
            </div>
        );
    }
}
