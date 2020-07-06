import React from 'react';
import './style.css';
import { Link } from 'react-router-dom';

export function NavSection({icon, title, description, href}) {
    return (
        <div className="NavSection">
            <Link to={ href }>
                <div className="nav-section-icon">
                    <img
                        type="image/svg+xml"
                        width="60"
                        height="60"
                        alt={ icon }
                        src={ `/img/${icon}.svg` }
                    />
                </div>
            </Link>
            <div className="nav-section-content">
                <div className="nav-section-title">
                    <Link to={ href }>{ title }</Link>
                </div>
                <div className="nav-section-description">
                    { description }
                </div>
            </div>
        </div>
    );
}
