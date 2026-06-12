import React, { useContext } from 'react';
import './Header.scss';
import WidgetContext from '../WidgetContext.jsx';

export default function Header() {
    let context = useContext(WidgetContext);
    return (
        <div className="Header">
            <h2 className="title text-center">
                {context.type === 'organisme' ? 'Avis sur le centre de formation' : 'Avis d\'anciens stagiaires'}
            </h2>
        </div>
    );
}

