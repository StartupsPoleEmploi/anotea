import React, { useContext } from 'react';
import './Header.scss';
import WidgetContext from './options/WidgetContext.jsx';

export default function Header() {
    let context = useContext(WidgetContext);
    return (
        <div className="Header">
            <div className="title text-center">
                {context.type === 'organisme' ? 'Avis sur le centre de formation' : 'Avis d\'anciens stagiaires'}
            </div>
        </div>
    );
};

