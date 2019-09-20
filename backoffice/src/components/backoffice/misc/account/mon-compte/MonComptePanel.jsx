import React from 'react';
import { ChangePassword } from './ChangePassword';
import DeprecatedPanel from '../../../common/page/DeprecatedPanel';
import './MonComptePanel.scss';

export default class MonComptePanel extends React.Component {

    render() {
        return <DeprecatedPanel className="MonComptePanel" results={<ChangePassword />} />;
    }
}
