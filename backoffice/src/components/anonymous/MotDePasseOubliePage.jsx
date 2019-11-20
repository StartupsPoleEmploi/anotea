import React from 'react';
import PropTypes from 'prop-types';
import Page from '../common/page/Page';
import Panel from '../common/page/panel/Panel';
import InputText from '../common/page/form/InputText';
import Button from '../common/Button';
import { CenteredForm } from '../common/page/form/CenteredForm';
import { askNewPassword } from './passwordService';

export default class MotDePasseOubliePage extends React.Component {

    static propTypes = {
        navigator: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            identifiant: '',
            error: null,
        };
    }

    onSubmit = () => {
        this.setState({ loading: true });

        askNewPassword(this.state.identifiant)
        .then(() => {
            this.setState({ error: null, identifiant: '', loading: false }, () => {
                this.props.navigator.goToPage('/admin/login', { message: 'Une email vous a été envoyé.' });
            });
        })
        .catch(() => {
            this.setState({ error: 'Une erreur est survenue', loading: false });
        });
    };

    render() {

        return (
            <Page className="grey"
                panel={
                    <Panel
                        backgroundColor="grey"
                        results={
                            <CenteredForm
                                title={<div className="title">Mot de passe oublié</div>}
                                elements={
                                    <>
                                        <hr className="grey" />
                                        <label>Entrez votre identifiant</label>
                                        <InputText
                                            value={this.state.identifiant}
                                            placeholder="Adresse email ou siret"
                                            error={this.state.error}
                                            onChange={event => this.setState({ identifiant: event.target.value })}
                                        />
                                        <hr className="grey-5" />
                                        <p className="clarification mt-3">
                                            L&apos;adresse mail est celle sur laquelle vous avez reçu la
                                            proposition de création de compte Anotéa,
                                            si vous ne la connaissez pas,
                                            <a
                                                className="contactez-nous"
                                                href="mailto:anotea@pole-emploi.fr">
                                                contactez-nous
                                            </a>.
                                        </p>
                                    </>
                                }
                                buttons={
                                    <>
                                        <Button
                                            size="small"
                                            type="submit"
                                            onClick={this.props.navigator.goBack}
                                        >
                                            Retour
                                        </Button>
                                        <Button
                                            type="submit"
                                            size="large"
                                            color="black"
                                            disabled={this.state.loading}
                                            onClick={this.onSubmit}
                                        >
                                            Confirmer
                                        </Button>
                                    </>
                                }
                            />
                        }
                    />
                }
            />
        );
    }
}
