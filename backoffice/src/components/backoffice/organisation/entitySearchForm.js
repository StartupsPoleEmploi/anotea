import React from 'react';
import ReactSelect from 'react-select';

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
                <ReactSelect
                    value={null}
                    onChange={this.handleEntityChange}
                    options={options}
                    placeholder="Sélectionner un lieu..."
                />
            </h2>
        );
    }
}
