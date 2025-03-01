import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import api from '../services/api';

// Definizione del tipo User
interface User {
  id: string;
  username: string;
  email: string;
  coins: number;
  createdAt: string;
}

// Definizione del tipo per il contesto di autenticazione
interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  signUp: (username: string, email: string, password: string) => Promise<void>;
}

// Creazione del contesto
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Hook personalizzato per utilizzare il contesto
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider del contesto
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effetto per caricare l'utente dal storage all'avvio
  useEffect(() => {
    // Qui implementeremo il caricamento dell'utente dal secure storage
    // Per ora, simuliamo un caricamento
    const loadUser = async () => {
      try {
        // Simuliamo un ritardo di caricamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Per ora, non carichiamo nessun utente
        setUser(null);
      } catch (error) {
        console.error('Errore nel caricamento dell\'utente:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Funzione per il login
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Chiamata API per il login
      const response = await api.post('/auth/login', { email, password });
      
      // Salva il token e l'utente
      const { token, user } = response.data;
      
      // Qui salveremo il token nel secure storage
      
      // Imposta l'utente nel contesto
      setUser(user);
    } catch (error) {
      console.error('Errore durante il login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione per la registrazione
  const signUp = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Chiamata API per la registrazione
      console.log('Invio richiesta di registrazione:', { username, email, password: '***' });
      const response = await api.post('/auth/register', { username, email, password });
      
      console.log('Risposta registrazione:', response.data);
      
      // Salva il token e l'utente
      const { token, user } = response.data;
      
      // Qui salveremo il token nel secure storage
      
      // Imposta l'utente nel contesto
      setUser(user);
      
      return user;
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione per il logout
  const signOut = () => {
    // Rimuovi il token dal secure storage
    
    // Reimposta l'utente a null
    setUser(null);
  };

  // Valore del contesto
  const value: AuthContextData = {
    user,
    isLoading,
    signIn,
    signOut,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 