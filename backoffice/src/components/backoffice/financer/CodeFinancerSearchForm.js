import React from 'react';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';
import VirtualizedSelect from 'react-virtualized-select';

export default class OrganisationSearchForm extends React.PureComponent {

    state = {};

    constructor(props) {
        super(props);
        this.handleFinancerChange = props.handleFinancerChange;
        this.unsetFinancer = props.unsetFinancer;
    }

    render() {
        const { currentFinancer, financers } = this.props;
        const options = financers.map(financer => ({
            label: financer.title + ` (` + financer._id + `)`,
            id: financer._id,
        }));
        return (
            <h2 className="subtitle">
                {currentFinancer &&
                <div>
                    <strong>Code financeur : {' '}
                        {currentFinancer.title}{' '}
                    </strong>
                    <small>({currentFinancer._id})</small>
                    <button type="button" className="close" aria-label="Close" onClick={this.unsetFinancer}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                }
                <div className="dropdown">
                    <VirtualizedSelect
                        onChange={this.handleFinancerChange}
                        options={options}
                        placeholder="Choisir un code financeur..."
                    />
                </div>
            </h2>
        );
    }
}
