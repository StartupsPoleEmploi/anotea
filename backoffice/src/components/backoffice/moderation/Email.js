import React from 'react';
import PropTypes from 'prop-types';

import './email.css';

import { updateEditedEmail, deleteEditedEmail } from '../../../lib/organisationService';

export default class Email extends React.Component {

    state = {
        active: false,
        mode: 'view',
        emailEdited: ''
    }

    static propTypes = {
        current: PropTypes.any.isRequired,
        active: PropTypes.any.isRequired,
        label: PropTypes.string.isRequired,
        organisationId: PropTypes.number.isRequired,
        deleteEditedEmail: PropTypes.func,
        updateEditedEmail: PropTypes.func,
        changeMode: PropTypes.func.isRequired,
        mode: PropTypes.string,
        editButton: PropTypes.bool.isRequired
    }

    constructor(props) {
        super(props);
        this.state.active = props.current === this.props.active;
        this.state.current = props.current;
        if (props.mode) {
            this.state.mode = props.mode;
        }
        this.changeMode = props.changeMode;
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ active: nextProps.current === nextProps.active, current: nextProps.current });
        if (nextProps.mode ) {
            this.setState({ mode: nextProps.mode });
        }
    }

    cancel = () => {
        this.setState({ emailEdited: '' });
        this.props.changeMode('view');
    }

    update = () => {
        updateEditedEmail(this.props.organisationId, this.state.emailEdited).then(() => {
            this.props.changeMode('view');
            this.props.updateEditedEmail(this.state.emailEdited);
        });
    }

    delete = () => {
        deleteEditedEmail(this.props.organisationId).then(() => {
            this.props.deleteEditedEmail();
        });
    }

    handleEmailChange = event => {
        this.setState({ emailEdited: event.target.value });
    }

    render() {
        return (
            <div className={`email ${this.state.active ? 'active' : 'not-current'} ${this.props.deleteEditedEmail ? 'anoteaEmail' : ''}`}>

                {this.state.mode === 'view' &&
                    <div className="view">
                        <i className="icon glyphicon glyphicon-ok" /> <span>{this.props.label}</span> <a href={`mailto:${this.props.current}`}>{this.state.current}</a>

                        {this.state.active && this.props.editButton &&
                            <button className="btn btn-primary" onClick={this.changeMode.bind(this, 'edit')}><i className="glyphicon glyphicon-pencil" /> Modifier l'adresse Anotéa</button>
                        }

                        {this.props.deleteEditedEmail &&
                            <button className="btn btn-danger" onClick={this.delete}><i className="glyphicon glyphicon-remove-sign" /> Supprimer</button>
                        }
                    </div>
                }

                {this.state.mode === 'edit' &&
                    <div className="edit">
                        Anotea : <input type="text" value={this.state.editedEmail} onChange={this.handleEmailChange} /> <button className="btn btn-primary" onClick={this.update}> <i className="glyphicon glyphicon-ok-sign"></i> Mettre à jour</button> <button className="btn" onClick={this.cancel}>Annuler</button>
                    </div>
                }
            </div>
        );
    }
}
