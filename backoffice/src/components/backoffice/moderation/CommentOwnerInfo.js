import React                from 'react';
import {FormattedDate}      from "react-intl";

export default class CommentOwnerInfo extends React.Component {

    state = {};

    constructor(props) {
        super(props);
    }

    render() {
        const { props } = this;
        return (
            <div>
                {props.moderationTarget === 'stagiaires' ?
                <h3>
                    <i className="avatar glyphicon glyphicon-user"></i>

                    <div className="pseudo">
                        <span>
                        {props.advice.pseudoMasked !== true && <span>{props.advice.pseudo}</span>}
                            {props.advice.pseudoMasked === true && <em>{props.advice.pseudo}</em>}
                            {props.advice.pseudoMasked !== true && <small
                                onClick={props.handleMaskPseudo.bind(this, props.advice._id)}>affiché</small>}
                            {props.advice.pseudoMasked === true && <small
                                onClick={props.handleUnmaskPseudo.bind(this, props.advice._id)}>masqué</small>}
                        </span>
                    </div>
                    -&nbsp;
                    <FormattedDate
                        value={new Date(props.advice.date)}
                        day="numeric"
                        month="long"
                        year="numeric"/>
                    {((props.tab === 'all' && props.advice.published) || props.advice.published) &&
                    <span
                        className="badge published">Publié ({props.advice.qualification}) le <FormattedDate
                        value={new Date(props.advice.lastModerationAction)}
                        day="numeric"
                        month="numeric"
                        year="numeric"/></span>
                    }
                    {((props.tab === 'all' && props.advice.rejected) || props.advice.rejected) &&
                    <span
                        className="badge rejected">Rejeté ({props.advice.rejectReason}) le
                        <FormattedDate
                        value={new Date(props.advice.lastModerationAction)}
                        day="numeric"
                        month="numeric"
                        year="numeric"/>
                    </span>
                    }
                    {(props.tab === 'all' && props.advice.moderated !== true) &&
                    <span className="badge toModerate">&Agrave; modérer</span>
                    }
                    {(props.tab === 'all' && props.advice.reported) &&
                    <span className="badge reported">Signalé</span>
                    }
                </h3>
                :
                    <h3>
                        <i className="avatar glyphicon glyphicon-education"/>

                        <div className="pseudo">
                            <span>
                                {props.advice.training.organisation.name !== null &&
                                <span>{props.advice.training.organisation.name}</span>}
                            </span>
                        </div>
                        &nbsp;-&nbsp;
                        <FormattedDate
                            value={new Date(props.advice.answer.date)}
                            day="numeric"
                            month="long"
                            year="numeric"/>
                        {((props.tab === 'all' && props.advice.answer.published) || props.advice.answer.published) &&
                        <span
                            className="badge published">Publié ({props.advice.qualification}) le
                            <FormattedDate
                            value={new Date(props.advice.lastModerationAction)}
                            day="numeric"
                            month="numeric"
                            year="numeric"/>
                        </span>
                        }
                        {((props.tab === 'all' && props.advice.answer.rejected) || props.advice.answer.rejected) &&
                        <span
                            className="badge rejected">Rejeté ({props.advice.rejectReason}) le <FormattedDate
                            value={new Date(props.advice.lastModerationAction)}
                            day="numeric"
                            month="numeric"
                            year="numeric"/>
                        </span>
                        }
                        {(props.tab === 'all' && props.advice.answer.moderated !== true) &&
                        <span className="badge toModerate">&Agrave; modérer</span>
                        }
                        {(props.tab === 'all' && props.advice.answer.reported) &&
                        <span className="badge reported">Signalé</span>
                        }
                    </h3>
                }
            </div>
        );
    }
}
