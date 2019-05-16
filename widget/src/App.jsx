import React, { Component } from 'react';
import AnoteaWidget from "./widget/AnoteaWidget";
import ScoreWidget from "./widget/ScoreWidget";
import './widget/widget.scss';
import './App.scss';

class App extends Component {

    createWidget = layout => {
        return (
            <AnoteaWidget
                width={this.props.width}
                layout={layout}
                type={this.props.type}
                siret={this.props.siret}
                numeroAction={this.props.numeroAction}
                numeroSession={this.props.numeroSession}
                numeroFormation={this.props.numeroFormation} />
        )
    };

    createScoreWidget = () => {
        return (
            <ScoreWidget
                type={this.props.type}
                siret={this.props.siret}
                numeroAction={this.props.numeroAction}
                numeroSession={this.props.numeroSession}
                numeroFormation={this.props.numeroFormation} />
        );
    };

    render() {
        switch (this.props.layout) {
            case 'score':
                return <div className="anotea">{this.createScoreWidget()}</div>;
            case 'liste':
                return <div className="anotea">{this.createWidget('liste')}</div>;
            default:
                return <div className="anotea">{this.createWidget('carrousel')}</div>;
        }
    }

}

App.defaultProps = {
    type: 'organisme',
    siret: '18720092800112',
    layout: 'score',
};

export default App;
