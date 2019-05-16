import React, { Component } from 'react';
import AnoteaWidget from "./widget/AnoteaWidget";
import AnoteaScoreWidget from "./widget/AnoteaScoreWidget";
import './widget/widget.scss';

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
            <AnoteaScoreWidget
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
                return this.createScoreWidget();
            case 'liste':
                return this.createWidget('liste');
            default:
                return this.createWidget('carrousel');
        }
    }

}

App.defaultProps = {
    type: 'organisme',
    siret: '18720092800112',
    layout: 'score',
};

export default App;
