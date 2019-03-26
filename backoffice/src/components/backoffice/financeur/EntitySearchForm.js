import React from 'react';

export default class EntitySearchForm extends React.PureComponent {

    state = {};

    constructor(props) {
        super(props);
        this.handleEntityChange = props.handleEntityChange;
        this.unsetEntity = props.unsetEntity;
    }

    render() {
        const { currentEntity, entities } = this.props;
        return (
            <h2 className="subtitle">
                {currentEntity &&
                <div>
                    <strong>Lieu : {currentEntity.city}</strong>
                    <button type="button" className="close" aria-label="Close" onClick={this.unsetEntity}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                }
                <div className="dropdown">
                    <button className="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="true">
                        Changer de Lieu
                        <span className="caret"></span>
                    </button>
                    <div className="dropdown-menu">
                        {entities.map(entity =>
                            <a key={entity._id} className="dropdown-item" role="button"
                               onClick={this.handleEntityChange.bind(this, entity._id)}>{entity.city}
                                <small>({entity._id})</small>
                            </a>
                        )}
                    </div>
                </div>
            </h2>
        );
    }
}
