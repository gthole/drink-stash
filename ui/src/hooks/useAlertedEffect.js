import { useEffect, useContext } from 'react';
import { AppContext } from 'context/AppContext';
import { services } from 'services';

const BADREQ = 'Whoops, something looks wrong with your request. ' +
               'Please check it and try again.',
      AUTH = 'Hmm - what you\'re trying to do doesn\'t look right.',
      NOT_FOUND = 'Uh-oh, that resource wasn\'t found!',
      NOT_CONN = 'Hmm, looks like you\'re not connected to the internet.',
      ERROR = 'Darn. Something went wrong on the server. Please try again later.';

export function useAlertedEffect(func, deps) {
    const { addAlert, refreshUser } = useContext(AppContext);

    useEffect(() => {
        if (!func) return;
        func().catch((err) => {
            switch (err.status) {
                case 400:
                    addAlert('warn', BADREQ);
                    break;
                case 401:
                    // TODO: Fix this - test by restarting API with different
                    // API key
                    services.auth.logout();
                    refreshUser();
                    window.location = '/login';
                    break;
                case 403:
                    addAlert('warn', AUTH);
                    break;
                case 404:
                    addAlert('warn', NOT_FOUND);
                    break;
                case 0:
                    // Warn the user that we can't connect to the server
                    addAlert('info', NOT_CONN);
                    break;
                default:
                    console.log(err);
                    // Show generic error message to user
                    addAlert('error', ERROR);
                    break;
            }
        }).finally(() => {
            // Wait until roughly after the rest of the page view has rendered, and
            // then cache the body height to the session storage. The other half
            // of this functionality lives in the ScrollMemory component.
            setTimeout(() => {
                document.getElementById('root').style['min-height'] = '';
                const ph = document.body.scrollHeight;
                if (ph > window.innerHeight) {
                    services.cache.set(`ph_${window.location.pathname}`, `${ph}px`);
                }
            }, 500)
        });

    // eslint-disable-next-line
    }, deps);
}
