import React from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import { Select } from '../common/page/form/Form';
import { getRegionList } from '../../services/anonymous';

import './ContactRegion.scss';

export default class ContactRegion extends React.Component {

    state = {

    }

    static propTypes = {
        onContinue: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
    }

    componentDidMount = async () => {
        const regions = await getRegionList();
        this.setState({
            regions,
            selected: regions[0],
            email: regions[0].email
        });
    }

    updateSelection = option => {
        this.setState({
            selected: option,
            email: option.email
        })
    }

    doContinue = () => {
        this.props.onContinue(this.state.email);
    }

    cancel = () => {
        this.props.onContinue(null);
    }

    render() {

        return (
            <div className="Modal">
                <div className='modal' tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Contactez-nous</h5>
                            </div>
                            <div className="modal-body">
                                <div>
                                    <h6>Renseigner votre département</h6>
                                    { this.state.regions &&
                                        <Select
                                            value={this.state.selected}
                                            options={this.state.regions}
                                            optionKey="codeRegion"
                                            label={option => option.nom}
                                            onChange={option => this.updateSelection(option)}
                                            isClearable={false}
                                        />
                                    }
                                </div>
                            </div>
                            <div className="modal-footer">
                                <div className="d-flex justify-content-end">
                                    <Button size="large" onClick={this.cancel}>
                                        Annuler
                                    </Button>
                                    <Button size="large" onClick={this.doContinue}>
                                        Continuer
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
