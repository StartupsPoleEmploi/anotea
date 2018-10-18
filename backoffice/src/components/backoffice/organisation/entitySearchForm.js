import React from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';

export default class OrganisationSearchForm extends React.PureComponent {

    state = {};

    constructor(props) {
        super(props);
        this.handleEntityChange = props.handleEntityChange;
        this.unsetEntity = props.unsetEntity;
    }

    render() {
        const { entities, currentEntity } = this.props;
        const options = entities.map(entity => ({
            label: entity.city + ` (` + entity.id + `)`,
            id: entity.id,
        }));

        return (
            <h2 className="subtitle">
                {currentEntity &&
                <div>
                    <strong>Lieu : {' '}
                        {currentEntity.city}{' '}
                        {/*<small>({currentOrganisation.count}Avis)</small>*/}
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
