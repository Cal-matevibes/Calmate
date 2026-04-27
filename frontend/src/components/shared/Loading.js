import React from 'react';
import './Loading.css';

function Loading({ text = 'Cargando...', fullPage = false }) {
    const content = (
        <div className="loading-scene">
            <div className="loading-logo-wrap">
                <div className="loading-ring loading-ring-1" />
                <div className="loading-ring loading-ring-2" />
                <div className="loading-ring loading-ring-3" />
                
                <img
                    src="/logo-png.png"
                    alt="Cal-mate"
                    className="loading-logo"
                />
            </div>
            {text && <p className="loading-text">{text}</p>}
        </div>
    );

    if (fullPage) {
        return <div className="loading-fullpage">{content}</div>;
    }

    return <div className="loading-container">{content}</div>;
}

export default Loading;

