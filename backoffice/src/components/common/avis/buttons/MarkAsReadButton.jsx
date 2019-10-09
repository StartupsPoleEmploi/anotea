import React from 'react';
import PropTypes from 'prop-types';
import { markAvisAsRead } from '../../../../services/avisService';
import Button from '../../Button';

export default class MarkAsReadButton extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    onClick = async () => {
        let { avis } = this.props;

        let updated = await markAvisAsRead(avis._id, !avis.read);
        this.props.onChange(updated, {
            message: {
                type: 'local',
                text: updated.read ? `L'avis a été marquée comme <b>lue</b>.` : `L'avis a été marquée comme <b>non lue</b>.`,
            },
        });
    };

    render() {
        let { avis } = this.props;

        return (
            <div className="MarkAsReadButton">
                <Button size="large" color="green" onClick={this.onClick}>
                    <i className={`far ${avis.read ? 'fa-eye-slash' : 'fa-eye'} a-icon`} />
                </Button>
            </div>
        );
    }
}