import React from 'react';
import PropTypes from 'prop-types';

import './email.css';

import { updateEditedEmail } from '../../../lib/organisationService';

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
        organisationId: PropTypes.number.isRequired
    }

    constructor(props) {
        super(props);
        this.state.active = props.current === this.props.active;
        this.state.current = props.current;
    }

    changeMode = mode => {
        this.setState({ mode: mode });
    }

    cancel = () => {
        this.setState({ emailEdited: '' });
        this.changeMode('view');
    }

    update = () => {
        updateEditedEmail(this.props.organisationId, this.state.emailEdited).then(() => {
            this.changeMode('view');
            this.setState({ current: this.state.emailEdited });
        });
    }

    handleEmailChange = event => {
        this.setState({ emailEdited: event.target.value });
    }

    render() {
        return (
            <div className={`email ${this.state.active ? 'active' : 'not-current'}`}>
                {this.state.mode === 'view' &&
                    <div>
                        <i className="icon glyphicon glyphicon-ok" /> <span>{this.props.label}</span> <a href="mailto:this.props.current">{this.state.current}</a>

                        {this.state.active &&
                            <button className="btn btn-primary" onClick={this.changeMode.bind(this, 'edit')}>Modifier</button>
                        }
                    </div>
                }

                {this.state.mode === 'edit' &&
                    <div>
                        Anotea : <input type="text" value={this.state.editedEmail} onChange={this.handleEmailChange} /> <button className="btn btn-primary" onClick={this.update}>Mettre à jour</button> <button className="btn" onClick={this.cancel}>Annuler</button>
                    </div>
                }
            </div>
        );
    }
}
