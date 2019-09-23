import React from 'react';
import Page from '../../../common/page/Page';
import { ChangePassword } from './ChangePassword';
import DeprecatedPanel from '../../../organisation/DeprecatedPanel';

export default class MonComptePage extends React.Component {

    render() {
        return <Page
            panel={<DeprecatedPanel className="MonComptePage" results={<ChangePassword />} />}
        />;
    }
}
