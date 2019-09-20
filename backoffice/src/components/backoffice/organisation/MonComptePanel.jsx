import React from 'react';
import { ChangePassword } from '../misc/account/mon-compte/ChangePassword';
import DeprecatedPanel from './DeprecatedPanel';
import './MonComptePanel.scss';

export default class MonComptePanel extends React.Component {

    render() {
        return <DeprecatedPanel className="MonComptePanel" results={<ChangePassword />} />;
    }
}
