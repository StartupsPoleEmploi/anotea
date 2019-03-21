import React, { Component } from 'react';
import Funnel from './components/Funnel';
import './App.scss';

class App extends Component {

    state = {
        token: null,
        showErrorPage: false,
    };

    componentDidMount() {
        let slashes = window.location.href.split('/');
        this.setState({ token: slashes[slashes.length - 1] });
    }

    render() {
        return (
            <div className="anotea">
                {this.state.token &&
                <Funnel token={this.state.token} />
                }
            </div>
        );
    }
}

export default App;
