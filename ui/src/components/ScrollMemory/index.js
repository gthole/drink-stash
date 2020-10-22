import { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { services } from 'services';

// Set the body height from session cache whenever the user goes back
function setHeight() {
    const ph = services.cache.get(`ph_${window.location.pathname}`);
    document.getElementById('root').style['min-height'] = ph || '';
}
window.onpopstate = setHeight;

export function ScrollMemory() {
    const { pathname } = useLocation();
    const { action } = useHistory();

    useEffect(() => {
        // If a user navigates forward, then set the scroll to the top and clear
        // any min-height settings.
        if (action === 'PUSH') {
            window.scrollTo(0, 0);
            document.getElementById('root').style['min-height'] = '';
        }
    }, [action, pathname]);

    return null;
}
