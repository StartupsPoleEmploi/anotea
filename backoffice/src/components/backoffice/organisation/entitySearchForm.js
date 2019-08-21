import React from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import PropTypes from 'prop-types';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';

export default class EntitySearchForm extends React.PureComponent {

    state = {};

    constructor(props) {
        super(props);
        this.handleEntityChange = props.handleEntityChange;
        this.unsetEntity = props.unsetEntity;
    }

    static propTypes = {
        handleEntityChange: PropTypes.func.isRequired,
        unsetEntity: PropTypes.func.isRequired,
        entities: PropTypes.array.isRequired,
        currentEntity: PropTypes.object.isRequired
    };

    render() {
        const { entities, currentEntity } = this.props;
        const options = entities.map(entity => ({
            label: entity.city,
            codeINSEE: entity.codeINSEE,
        }));

        return (
            <h2 className="subtitle">
                {currentEntity &&
                <div>
                    <strong>Lieu : {' '}
                        {currentEntity.city}{' '}
                    </strong>
                    <button type="button" className="close" aria-label="Close" onClick={this.unsetEntity}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                }
                <div className="dropdown">
                    <VirtualizedSelect
                        onChange={this.handleEntityChange}
                        options={options}
                        placeholder="Sélectionner un lieu..."
                    />
                </div>
            </h2>
        );
    }
}
