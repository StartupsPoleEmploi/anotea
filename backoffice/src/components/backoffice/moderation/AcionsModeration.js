import React from 'react';

export default class AcionsModeration extends React.Component {

    state = {};

    constructor(props) {
        super(props);
    }

    render() {
        const {props} = this;
        return (
            <div>
                {(props.currentEdit === null || props.currentEdit.id !== props.advice._id) &&
                    <div>
                        {props.moderationTarget === 'stagiaires' ?
                            <div>
                                <p>{props.advice.comment.text}</p>
                                <div className="actions">
                                    {!props.advice.rejected && <div className="dropdown">
                                        <button className="btn btn-default dropdown-toggle btn-danger btn-xs"
                                                type="button"
                                                id="dropdownMenu1"
                                                data-toggle="dropdown"
                                                aria-haspopup="true"
                                                aria-expanded="true">
                                            <i className="glyphicon glyphicon-ban-circle"/> Rejeter
                                        </button>
                                        <ul className="dropdown-menu"
                                            aria-labelledby="dropdownMenu1">
                                            <li className="dropdown-header">Motif de rejet</li>
                                            <li><a
                                                onClick={props.handleReject.bind(this, props.advice._id, 'injure')}
                                                role="button">Injure</a></li>
                                            <li><a
                                                onClick={props.handleReject.bind(this, props.advice._id, 'alerte')}
                                                role="button">Alerte</a></li>
                                            <li><a
                                                onClick={props.handleReject.bind(this, props.advice._id, 'non concerné')}
                                                role="button">Non concerné</a></li>
                                        </ul>
                                    </div>}

                                    {(!props.advice.published || props.tab === 'reported') &&
                                    <div className="dropdown">
                                        <button className="btn btn-default dropdown-toggle btn-success btn-xs"
                                                type="button"
                                                id="dropdownMenu1"
                                                data-toggle="dropdown"
                                                aria-haspopup="true"
                                                aria-expanded="true">
                                            <i className="glyphicon glyphicon-ok-circle"/> Publier
                                        </button>
                                        <ul className="dropdown-menu"
                                            aria-labelledby="dropdownMenu1">
                                            <li className="dropdown-header">Qualification</li>
                                            <li><a
                                                onClick={props.handlePublish.bind(this, props.advice._id, 'négatif')}
                                                role="button">Négatif</a></li>
                                            <li><a
                                                onClick={props.handlePublish.bind(this, props.advice._id, 'positif')}
                                                role="button">Positif ou neutre</a></li>
                                            <li><a
                                                onClick={props.handlePublish.bind(this, props.advice._id, 'pe')}
                                                role="button">PE</a></li>
                                            <li><a
                                                onClick={props.handlePublish.bind(this, props.advice._id, 'of')}
                                                role="button">OF</a></li>
                                            <li><a
                                                onClick={props.handlePublish.bind(this, props.advice._id, 'cr')}
                                                role="button">CR</a></li>
                                        </ul>
                                    </div>}

                                    <button className="btn btn-primary btn-xs"
                                            onClick={props.handleEdit.bind(this, props.advice._id)}>
                                        <i className="glyphicon glyphicon-edit"/> Modifier
                                    </button>
                                </div>
                            </div>
                            :
                            <div>
                                <p>{props.advice.answer.text}</p>
                                <div className="actions">
                                    {!props.advice.answer.rejected &&
                                    <div className="dropdown">
                                        <button
                                            className="btn btn-default dropdown-toggle btn-danger btn-xs"
                                            type="button"
                                            onClick={props.handleReject.bind(this, props.advice._id, 'injure')}>
                                            <i className="glyphicon glyphicon-ban-circle"/> Rejeter
                                        </button>
                                    </div>
                                    }

                                    {(!props.advice.answer.published || props.state.tab === 'reported') &&
                                    <div className="dropdown">
                                        <button
                                            className="btn btn-default dropdown-toggle btn-success btn-xs"
                                            type="button"
                                            onClick={props.handlePublish.bind(this, props.advice._id, 'négatif')}>
                                            <i className="glyphicon glyphicon-ok-circle"/> Publier
                                        </button>
                                    </div>
                                    }

                                    <button className="btn btn-primary btn-xs"
                                            onClick={props.handleEdit.bind(this, props.advice._id)}>
                                        <i className="glyphicon glyphicon-edit"/> Modifier
                                    </button>
                                </div>
                            </div>
                        }
                    </div>
                }

                {props.currentEdit && props.currentEdit.id === props.advice._id &&
                <div>
                    <textarea   type="text"
                                className="form-control"
                                onChange={props.handleChange.bind(this, props.advice._id)}
                                value={props.advice.comment.text}/>
                    <div className="actions">
                        <div className="dropdown">
                            <button {...props.currentEdit.newValue === undefined ? {disabled: 'disabled'} : {}}
                                    className="btn btn-default dropdown-toggle btn-success btn-xs"
                                    type="button"
                                    id="dropdownMenu1"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="true">
                                    <i className="glyphicon glyphicon-ok-circle"/> Valider
                                et Publier
                            </button>
                            <ul className="dropdown-menu"
                                aria-labelledby="dropdownMenu1">
                                <li className="dropdown-header">Qualification</li>
                                <li><a
                                    onClick={props.handleUpdate.bind(this, props.advice._id, 'négatif')}
                                    role="button">Négatif</a></li>
                                <li><a
                                    onClick={props.handleUpdate.bind(this, props.advice._id, 'positif')}
                                    role="button">Positif ou neutre</a></li>
                                <li><a
                                    onClick={props.handleUpdate.bind(this, props.advice._id, 'pe')}
                                    role="button">PE</a></li>
                                <li><a
                                    onClick={props.handleUpdate.bind(this, props.advice._id, 'of')}
                                    role="button">OF</a></li>
                                <li><a
                                    onClick={props.handleUpdate.bind(this, props.advice._id, 'cr')}
                                    role="button">CR</a></li>
                            </ul>
                        </div>
                        <button className="btn btn-danger btn-xs"
                                onClick={props.handleCancel.bind(this, props.advice._id)}><i
                            className="glyphicon glyphicon-ban-circle"/> Annuler
                        </button>
                    </div>
                </div>
                }
            </div>
        );
    }
}
