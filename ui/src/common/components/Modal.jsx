import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import './Modal.scss';

export default class Modal extends React.Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        body: PropTypes.node.isRequired,
        onClose: PropTypes.func.isRequired,
        onConfirmed: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.modalRef = React.createRef();
        this.state = {
            showTransition: false,
        };
    }

    componentDidMount() {
        let body = document.getElementsByTagName('body')[0];
        body.classList.add('modal-open');
        body.style.paddingRight = '15px';

        this.triggerTransition();
        document.addEventListener("keydown", this.handleTabKey);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleTabKey);
    }

    handleTabKey = e => {
        const focusableModalElements = this.modalRef.current.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        const firstElement = focusableModalElements[0];
        const secondElement = focusableModalElements[1];
        const lastElement = focusableModalElements[2];

        
        if (e.key === "Escape") {//escape -> ferme
            this.props.onClose();
            return;
        }
        if(e.key === "Enter" && document.activeElement === firstElement) {//Entrer sur Croix -> ferme
            this.props.onClose();
            return;
        }
        else if (e.shiftKey && e.key === "Tab" && document.activeElement === firstElement) {//Shift + Tabulation sur Croix -> Confirmer
            lastElement.focus();
            e.preventDefault();
        }
        else if (!e.shiftKey && e.key === "Tab" && document.activeElement === firstElement) {//Tabulation sur Croix -> Annuler
            secondElement.focus();
            e.preventDefault();
        }
        else if (e.key === "Enter" && document.activeElement === secondElement) {//Entrer sur Annuler -> ferme
            this.props.onClose();
            return;
        }
        else if (e.shiftKey && e.key === "Tab" && document.activeElement === secondElement) {//Shift + Tabulation sur Annuler -> Croix
            firstElement.focus();
            e.preventDefault();
        }
        else if (!e.shiftKey && e.key === "Tab" && document.activeElement === secondElement) {//Tabulation sur Annuler -> Confirmer
            lastElement.focus();
            e.preventDefault();
        }
        else if (e.key === "Enter" && document.activeElement === lastElement) {//Entrer sur Confirmer -> Confirme
            this.props.onConfirmed();
            e.preventDefault();
        }else if (e.shiftKey && e.key === "Tab" && document.activeElement === lastElement) {//Shift + Tabulation sur Confirmer -> Annuler
            secondElement.focus();
            e.preventDefault();
        }
        else {//Tabulation sur confirmer -> Croix
            firstElement.focus();
            e.preventDefault();
        }
    };

    triggerTransition() {
        setTimeout(() => this.setState({ showTransition: true }), 5);
    }

    render() {
        let { title, body, onClose, onConfirmed, disabled } = this.props;
        let transitionClass = this.state.showTransition ? 'show' : '';

        return (
            <div className="Modal" aria-modal="true" aria-labelledby="dialogTitle" aria-describedby="dialog1Desc">
                <div className={`modal-backdrop fade ${transitionClass}`} />
                <div className={`modal fade ${transitionClass}`} tabIndex="-1" role="dialog" ref={this.modalRef}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 id="dialogTitle" className="modal-title">{title}</h5>
                                <button className="modal-cross" title="fermer la modal" onClick={onClose}>
                                    ✕
                                </button>
                            </div>
                            <div id="dialog1Desc" className="modal-body">
                                <div>{body}</div>
                            </div>
                            <div className="modal-footer">
                                <div className="d-flex justify-content-end">
                                    <Button disabled={disabled} size="small" color="red" onClick={onClose} className="mr-2">
                                        Annuler
                                    </Button>
                                    <Button disabled={disabled} size="large" color="blue" onClick={onConfirmed}>
                                        Confirmer
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
