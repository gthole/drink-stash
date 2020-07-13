import React, { useEffect } from 'react';
import './style.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { Button } from 'components/Forms';

export function Alerts({alerts, setAlerts}) {
    // Auto-expire alerts
    useEffect(() => {
        const expiry = alerts.reduce((r, a) => {
            const ex = 5000 - (Date.now() - a.ts);
            if (!r) return ex;
            return Math.min(r, ex);
        }, null);
        if (expiry !== null) {
            setTimeout(() => {
                setAlerts(alerts.filter(a => Date.now() - a.ts < 5000));
            }, expiry);
        }
    }, [alerts, setAlerts]);

    return (
        <div className="Alerts">
            {
                alerts.map((a, i) => (
                    <div className={ `Alert alert-${a.type}` } key={ 'alert-' + i }>
                        <div>{ a.message }</div>
                        <Button
                            type="clear"
                            onClick={ () => {
                                alerts.splice(i, 1);
                                setAlerts([...alerts]);
                            }}
                            children={ <FontAwesomeIcon icon={ faTimes }/> }
                        />
                    </div>
                ))
            }
        </div>
    );
}
