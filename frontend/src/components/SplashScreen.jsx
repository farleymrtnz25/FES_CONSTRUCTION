import React, { useState, useEffect } from 'react';
import splashImg from '../assets/splash.png';
import logoImg from '../assets/logo.png';

export default function SplashScreen({ onFinish }) {
    const [fading, setFading] = useState(false);

    useEffect(() => {
        const timer1 = setTimeout(() => {
            setFading(true);
        }, 2200);

        const timer2 = setTimeout(() => {
            onFinish();
        }, 2600);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onFinish]);

    return (
        <div 
            className={`app-splash-screen${fading ? ' fading-out' : ''}`}
            onClick={() => onFinish()}
            style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.65)), url(${splashImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="splash-content">
                <div className="splash-logo-container">
                    <img src={logoImg} alt="FES Construcción Logo" className="splash-logo" />
                </div>
                <h1 className="splash-title">F.E.S. CONSTRUCCIÓN</h1>
                <p className="splash-subtitle">Materiales Artesanales de Nemocón</p>
                <div className="splash-loader">
                    <div className="splash-loader-bar" />
                </div>
            </div>
            <div className="splash-footer-text">
                Calidad Artesanal Colombiana
            </div>
        </div>
    );
}
