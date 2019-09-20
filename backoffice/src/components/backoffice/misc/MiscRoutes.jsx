import React from 'react';
import { Route } from 'react-router-dom';
import LibraryPage from './LibraryPage';

export default class MiscRoutes extends React.Component {

    render() {
        return (
            <div>
                <Route exact path="/admin/library" render={() => <LibraryPage />} />
            </div>
        );
    }
}
