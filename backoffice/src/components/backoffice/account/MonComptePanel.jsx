import React from 'react';
import { ChangePassword } from './ChangePassword';
import Panel from '../common/panel/Panel';
import './MonComptePanel.scss';

export default class MonComptePanel extends React.Component {

    render() {
        return <Panel className="MonComptePanel" results={<ChangePassword />} />;
    }
}
