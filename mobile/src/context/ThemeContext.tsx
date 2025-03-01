import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definizione dei tipi
type ThemeType = 'light' | 'dark';

interface ThemeContextData {
  theme: ThemeType;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  colors: {
    background: string;
    card: string;
    text: string;
    subtext: string;
    primary: string;
    border: string;
    accent: string;
    error: string;
    success: string;
    input: string;
  };
}

// Creazione del contesto
const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

// Hook personalizzato per utilizzare il contesto
export const useTheme = () => {
  return useContext(ThemeContext);
};

// Provider del contesto
interface ThemeProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = '@theme_mode';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>(deviceTheme as ThemeType || 'light');

  // Carica il tema salvato all'avvio
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Errore nel caricamento del tema:', error);
      }
    };

    loadTheme();
  }, []);

  // Salva il tema quando cambia
  useEffect(() => {
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, theme);
      } catch (error) {
        console.error('Errore nel salvataggio del tema:', error);
      }
    };

    saveTheme();
  }, [theme]);

  // Funzione per cambiare il tema
  const toggleTheme = () => {
    setThemeState(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Funzione per impostare un tema specifico
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  // Colori per i temi
  const lightColors = {
    background: '#FFFFFF',
    card: '#F8F8F8',
    text: '#1A1A1A',
    subtext: '#757575',
    primary: '#6200EE',
    border: '#E0E0E0',
    accent: '#03DAC6',
    error: '#B00020',
    success: '#4CAF50',
    input: '#F5F5F5',
  };

  const darkColors = {
    background: '#121212',
    card: '#1E1E1E',
    text: '#E0E0E0',
    subtext: '#9E9E9E',
    primary: '#BB86FC',
    border: '#2C2C2C',
    accent: '#03DAC6',
    error: '#CF6679',
    success: '#4CAF50',
    input: '#2A2A2A',
  };

  const colors = theme === 'dark' ? darkColors : lightColors;
  const isDarkMode = theme === 'dark';

  // Valore del contesto
  const value: ThemeContextData = {
    theme,
    isDarkMode,
    toggleTheme,
    setTheme,
    colors,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}; 