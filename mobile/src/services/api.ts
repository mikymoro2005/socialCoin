import axios from 'axios';
import config from '../utils/config';

// Crea un'istanza di axios con la configurazione di base
const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Timeout di 10 secondi
});

// Interceptor per aggiungere il token di autenticazione alle richieste
api.interceptors.request.use(
  async (config) => {
    // In futuro, qui recupereremo il token dal secure storage
    const token = null; // await getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`Richiesta API: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('Errore nella configurazione della richiesta:', error);
    return Promise.reject(error);
  }
);

// Interceptor per gestire gli errori di risposta
api.interceptors.response.use(
  (response) => {
    console.log(`Risposta API: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Gestione degli errori comuni
    if (error.response) {
      // Il server ha risposto con un codice di stato diverso da 2xx
      console.error('Errore API:', error.response.status, error.response.data);
      
      // Gestione token scaduto (401)
      if (error.response.status === 401) {
        // Qui implementeremo la logica per il logout o il refresh del token
        console.log('Token scaduto o non valido');
      }
    } else if (error.request) {
      // La richiesta è stata effettuata ma non è stata ricevuta alcuna risposta
      console.error('Nessuna risposta dal server:', error.request);
      error.message = 'Impossibile connettersi al server. Verifica la tua connessione internet.';
    } else {
      // Si è verificato un errore durante l'impostazione della richiesta
      console.error('Errore di configurazione:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 