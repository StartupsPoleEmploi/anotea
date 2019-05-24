import React from 'react';
import PropTypes from 'prop-types';

import './notice.css';

export default class SideMenu extends React.PureComponent {

    state = {
        shown: true
    }

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
    }

    hide = () => {
        this.setState({ shown: false });
    }

    render() {
        return (
            <div className={`notice alert ${!this.state.shown ? 'hidden' : ''}`}>
                <button className="close" onClick={this.hide}>x</button>
                <p>Vous avez des questions sur le fonctionnement d'Anotea?</p>
                <p>Consulter notre page <a
                    href={`https://anotea.pole-emploi.fr/static/notices/notice-${this.props.codeRegion}.pdf`}>"Aide"</a></p>
            </div>
        );
    }
}
