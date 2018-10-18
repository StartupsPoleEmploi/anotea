import React from 'react';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';
import VirtualizedSelect from 'react-virtualized-select';

export default class OrganisationSearchForm extends React.PureComponent {

    state = {};

    constructor(props) {
        super(props);
        this.handleOrganisationChange = props.handleOrganisationChange;
        this.unsetOrganisation = props.unsetOrganisation;
    }

    render() {
        const { currentOrganisation, organisations } = this.props;
        const options = organisations.map(organisation => ({
            label: organisation.name + ` (` + organisation.label + `) ` + organisation.count + `Avis`,
            id: organisation._id,
        }));

        return (
            <h2 className="subtitle">
                {currentOrganisation &&
                <div>
                    <strong>Organisme : {' '}
                        {currentOrganisation.name}{' '}
                        <small>({currentOrganisation.count}Avis)</small>
                    </strong>
                    <button type="button" className="close" aria-label="Close" onClick={this.unsetOrganisation}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                }
                <div className="dropdown">
                    <VirtualizedSelect
                        onChange={this.handleOrganisationChange}
                        options={options}
                        placeholder="Choisir votre organisme de formation..."
                    />
                </div>
            </h2>
        );
    }
}
