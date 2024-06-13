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
        let body = document.getElementsByTagName('body')[0];
        body.classList.remove('modal-open');
    }

    handleTabKey = e => {
        const focusableModalElements = this.modalRef.current.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        const activeIndex = Array.from(focusableModalElements).indexOf(document.activeElement);
        const firstElement = focusableModalElements[0];
        const lastElement = focusableModalElements[focusableModalElements.length - 1];

        if (e.key === "Escape") { //escape -> ferme
            this.props.onClose();
            return;
        }
        if(e.key === "Enter" && document.activeElement === firstElement) {//Entrer sur Croix -> ferme
            this.props.onClose();
            return;
        }

        if (e.shiftKey && e.key === "Tab" && document.activeElement === firstElement) {
            // Shift + Tabulation sur le premier élément -> dernier élément
            lastElement.focus();
            e.preventDefault();
            return;
        }

        if (!e.shiftKey && e.key === "Tab" && document.activeElement === lastElement) {
            // Tabulation sur le dernier élément -> premier élément
            firstElement.focus();
            e.preventDefault();
            return;
        }
    
        // Gestion de la navigation pour les éléments au milieu
        if (e.key === "Tab") {
            const nextIndex = e.shiftKey ? (activeIndex - 1) : (activeIndex + 1);
            const nextElement = focusableModalElements[nextIndex];
            
            if (nextElement) {
                nextElement.focus();
                e.preventDefault();
            }
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
