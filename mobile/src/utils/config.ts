// Configurazione dell'ambiente
const ENV = {
  dev: {
    // Utilizzo l'indirizzo IP locale invece di localhost
    // Questo permette al dispositivo/simulatore di connettersi al backend
    apiUrl: 'http://172.20.10.5:3001/api',
  },
  prod: {
    apiUrl: 'https://api.socialcoin.com/api', // Da cambiare con l'URL di produzione
  },
};

// Determina l'ambiente corrente
const getEnvVars = () => {
  // In un'app reale, questo verrebbe determinato in base a variabili d'ambiente
  // Per ora, usiamo sempre l'ambiente di sviluppo
  return ENV.dev;
};

export default getEnvVars(); 