import React from 'react';
import { ChangePassword } from './ChangePassword';
import Panel from '../Panel';

export class MyAccount extends React.Component {

    render() {

        return (
            <Panel
                header={
                    <div>
                        <h1 className="title">Paramètres de compte</h1>
                        <p className="subtitle">
                            C&apos;est ici que vous pourrez personnaliser votre compte.
                        </p>
                    </div>
                }
                results={
                    <ChangePassword />
                }
            >
                
            </Panel>
        );
    }
}