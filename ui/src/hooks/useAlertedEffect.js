import { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AppContext } from 'context/AppContext';

const BADREQ = 'Whoops, something looks wrong with your request. ' +
               'Please check it and try again.',
      AUTH = 'Hmm - what you\'re trying to do doesn\'t look right.',
      NOT_FOUND = 'Uh-oh, that resource wasn\'t found!',
      NOT_CONN = 'Hmm, looks like you\'re not connected to the internet.',
      ERROR = 'Darn. Something went wrong on the server. Please try again later.';

export function useAlertedEffect(func, deps) {
    const { addAlert } = useContext(AppContext);
    const history = useHistory();

    useEffect(() => {
        if (!func) return;
        func().catch((err) => {
            switch (err.status) {
                case 400:
                    addAlert('warn', BADREQ);
                    break;
                case 401:
                    history.push('/login', {});
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
        })
    // eslint-disable-next-line
    }, deps);
}
