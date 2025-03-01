import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipo per le notifiche
export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system' | 'reward';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: {
    userId?: string;
    username?: string;
    avatar?: string;
    postId?: string;
    commentId?: string;
    rewardId?: string;
  };
}

// Dati di esempio per le notifiche
const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'like',
    title: 'Nuovo like',
    message: 'Matteo Bianchi ha messo like al tuo post',
    read: false,
    createdAt: '2025-01-02T14:30:00Z',
    data: {
      userId: '102',
      username: 'matteo_bianchi',
      avatar: 'https://ui-avatars.com/api/?name=Matteo+Bianchi&background=random',
      postId: '1',
    },
  },
  {
    id: '2',
    type: 'comment',
    title: 'Nuovo commento',
    message: 'Marco Verdi ha commentato il tuo post: "Bellissimo post, complimenti!"',
    read: false,
    createdAt: '2025-01-02T12:15:00Z',
    data: {
      userId: '103',
      username: 'marco_verdi',
      avatar: 'https://ui-avatars.com/api/?name=Marco+Verdi&background=random',
      postId: '3',
      commentId: '1',
    },
  },
  {
    id: '3',
    type: 'follow',
    title: 'Nuovo follower',
    message: 'Giulia Neri ha iniziato a seguirti',
    read: true,
    createdAt: '2025-01-01T18:20:00Z',
    data: {
      userId: '104',
      username: 'giulia_neri',
      avatar: 'https://ui-avatars.com/api/?name=Giulia+Neri&background=random',
    },
  },
  {
    id: '4',
    type: 'mention',
    title: 'Sei stato menzionato',
    message: 'Mario Rossi ti ha menzionato in un commento: "@mario_rossi vieni a vedere questo!"',
    read: true,
    createdAt: '2025-01-01T10:45:00Z',
    data: {
      userId: '105',
      username: 'mario_rossi',
      avatar: 'https://ui-avatars.com/api/?name=Mario+Rossi&background=random',
      postId: '5',
      commentId: '3',
    },
  },
  {
    id: '5',
    type: 'system',
    title: 'Benvenuto su SocialCoin',
    message: 'Grazie per esserti iscritto! Hai ricevuto 1.00 SocialCoin come bonus di benvenuto.',
    read: true,
    createdAt: '2025-01-01T08:00:00Z',
  },
  {
    id: '6',
    type: 'reward',
    title: 'Premio sbloccato',
    message: 'Hai sbloccato il badge "Primo Post"! Continua così!',
    read: false,
    createdAt: '2025-01-01T09:30:00Z',
    data: {
      rewardId: '101',
    },
  },
];

// Definizione del contesto
interface NotificationContextData {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => Promise<void>;
}

// Creazione del contesto
const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

// Hook personalizzato per utilizzare il contesto
export const useNotifications = () => {
  return useContext(NotificationContext);
};

// Provider del contesto
interface NotificationProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = '@notifications';

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(DUMMY_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);
  
  // Carica le notifiche salvate all'avvio
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const savedNotifications = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }
      } catch (error) {
        console.error('Errore nel caricamento delle notifiche:', error);
      }
    };

    loadNotifications();
  }, []);

  // Salva le notifiche quando cambiano
  useEffect(() => {
    const saveNotifications = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      } catch (error) {
        console.error('Errore nel salvataggio delle notifiche:', error);
      }
    };

    saveNotifications();
  }, [notifications]);
  
  // Conta le notifiche non lette
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Aggiunge una nuova notifica
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
  };
  
  // Segna una notifica come letta
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  // Segna tutte le notifiche come lette
  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };
  
  // Aggiorna le notifiche
  const refreshNotifications = async () => {
    setLoading(true);
    
    // In una implementazione reale, qui chiameremmo un'API
    // Per ora, simuliamo un ritardo
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setLoading(false);
        resolve();
      }, 1500);
    });
  };
  
  // Valore del contesto
  const value: NotificationContextData = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
  
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export default NotificationProvider; 