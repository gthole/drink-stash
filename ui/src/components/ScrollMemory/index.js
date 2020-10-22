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

        // Wait until roughly after the rest of the page view has rendered, and
        // then cache the body height to the session storage. This could be
        // done more explicitly with a service that subcomponents call when
        // they've finished loading resources, but that'd be less neatly
        // contained than this is, even though there's a race condition here.
        setTimeout(() => {
            const ph = document.body.scrollHeight;
            if (ph > window.innerHeight) {
                services.cache.set(`ph_${pathname}`, `${ph}px`);
            }
        }, 1600)

    }, [action, pathname]);

    return null;
}
