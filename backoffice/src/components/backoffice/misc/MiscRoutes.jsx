import React from 'react';
import { Route } from 'react-router-dom';
import LibraryPanel from './LibraryPanel';

export default class MiscRoutes extends React.Component {

    render() {
        return (
            <div>
                <Route exact path="/admin/library" component={LibraryPanel} />
            </div>
        );
    }
}
