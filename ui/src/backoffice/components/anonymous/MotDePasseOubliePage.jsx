import React from 'react';
import PropTypes from 'prop-types';
import Page from '../common/page/Page';
import Panel from '../common/page/panel/Panel';
import InputText from '../common/page/form/InputText';
import Button from '../../../common/components/Button';
import { CenteredForm } from '../common/page/form/CenteredForm';
import { askNewPassword } from '../../services/passwordService';
import BackofficeContext from '../../BackofficeContext';
import './LoginPage.scss';


export default class MotDePasseOubliePage extends React.Component {

    static contextType = BackofficeContext;

    static propTypes = {
        router: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
        this.state = {
            loading: false,
            identifiant: '',
            error: null,
        };
    }

    onSubmit = () => {

        let { showMessage } = this.context;

        this.setState({ loading: true });

        askNewPassword(this.state.identifiant)
        .then(() => {
            showMessage({
                text: 'Si vous avez fourni un identifiant correct, un email vous a été envoyé.'
            });
            this.setState({ error: null, identifiant: '', loading: false }, () => {
                this.props.router.goToPage('/backoffice/login');
            });
        })
        .catch(() => {
            this.setState({ error: "Veuillez remplir votre identifiant.", loading: false },()=>{
                if (this.inputRef.current && this.inputRef.current.focus) {
                    this.inputRef.current.focus();
                }
            }
        );
        });
    };

    render() {

        return (
            <>
            <title>Mot de passe oublié | Anotéa</title>
            <Page
                className="MotDePasseOubliePage"
                title={'Votre espace Anotéa'}
                panel={
                    <Panel
                        backgroundColor="grey"
                        results={
                            <CenteredForm
                                title="Mot de passe oublié"
                                elements={
                                    <>
                                        <label htmlFor="identifiant">Entrez votre identifiant</label>
                                        <InputText
                                            id="identifiant"
                                            value={this.state.identifiant}
                                            placeholder="Identifiant"
                                            error={this.state.error}
                                            onChange={event => this.setState({ identifiant: event.target.value })}
                                            autoComplete="username"
                                            inputRef={this.inputRef}
                                            aria-describedby="clarification-1"
                                        />
                                        <p className="clarification mt-3" id="clarification-1">
                                            Si vous êtes un organisme, vous devez désormais renseigner votre numéro de
                                            SIRET.
                                        </p>
                                        <p className="clarification">
                                            Vous receverez un email de réinitialisation de mot de passe à
                                            l&apos;adresse email
                                            sur laquelle vous avez reçu la proposition de création de compte Anotéa,
                                            si vous ne la connaissez pas,
                                            <a
                                                className="contactez-nous"
                                                style={{"text-decoration-line": "underline;"}}
                                                href="mailto:anotea@francetravail.fr">
                                                contactez-nous
                                            </a>.
                                        </p>
                                    </>
                                }
                                buttons={
                                    <>
                                        <Button
                                            size="small"
                                            onClick={this.props.router.goBack}
                                        >
                                            Retour
                                        </Button>
                                        <Button
                                            type="submit"
                                            size="large"
                                            color="orange"
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
            </>
        );
    }
}
