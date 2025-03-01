import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../navigation/types';
import { useNotifications, Notification } from '../context/NotificationContext';

type NotificationsScreenNavigationProp = NativeStackNavigationProp<MainTabParamList>;

const NotificationsScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    refreshNotifications 
  } = useNotifications();
  
  // Stati
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  
  // Funzione per formattare la data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} secondi fa`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minuti fa`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} ore fa`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} giorni fa`;
    }
  };
  
  // Filtra le notifiche in base al filtro attivo
  const getFilteredNotifications = () => {
    if (activeFilter === 'all') {
      return notifications;
    } else {
      return notifications.filter(notification => !notification.read);
    }
  };
  
  // Aggiorna le notifiche
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };
  
  // Gestisce il tap su una notifica
  const handleNotificationPress = (notification: Notification) => {
    // Segna la notifica come letta
    markAsRead(notification.id);
    
    // Naviga alla schermata appropriata in base al tipo di notifica
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'mention':
        if (notification.data?.postId) {
          // Qui navigheremmo alla schermata del post
          console.log(`Navigazione al post ${notification.data.postId}`);
        }
        break;
      case 'follow':
        if (notification.data?.userId) {
          // Qui navigheremmo al profilo dell'utente
          console.log(`Navigazione al profilo di ${notification.data.username}`);
        }
        break;
      case 'reward':
        if (notification.data?.rewardId) {
          // Qui navigheremmo alla schermata dei premi
          navigation.navigate('Rewards');
        }
        break;
      default:
        break;
    }
  };
  
  // Ottieni l'icona in base al tipo di notifica
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Ionicons name="heart" size={24} color="#e74c3c" />;
      case 'comment':
        return <Ionicons name="chatbubble" size={24} color="#3498db" />;
      case 'follow':
        return <Ionicons name="person-add" size={24} color="#2ecc71" />;
      case 'mention':
        return <Ionicons name="at" size={24} color="#9b59b6" />;
      case 'system':
        return <Ionicons name="information-circle" size={24} color="#f39c12" />;
      case 'reward':
        return <Ionicons name="trophy" size={24} color="#f1c40f" />;
      default:
        return <Ionicons name="notifications" size={24} color={colors.primary} />;
    }
  };
  
  // Renderizza una singola notifica
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { 
            backgroundColor: item.read ? colors.card : colors.card + '80',
            borderLeftColor: item.read ? colors.border : colors.primary,
          }
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationIconContainer}>
          {getNotificationIcon(item.type)}
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          
          <Text style={[styles.notificationMessage, { color: colors.subtext }]}>
            {item.message}
          </Text>
          
          <Text style={[styles.notificationTime, { color: colors.subtext }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        
        {!item.read && (
          <View style={[styles.unreadIndicator, { backgroundColor: colors.primary }]} />
        )}
      </TouchableOpacity>
    );
  };
  
  // Renderizza l'header con i filtri
  const renderHeader = () => {
    return (
      <View style={[styles.headerContainer, { backgroundColor: colors.card }]}>
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { 
                backgroundColor: activeFilter === 'all' ? colors.primary : 'transparent',
                borderColor: colors.primary,
              }
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text 
              style={[
                styles.filterText, 
                { color: activeFilter === 'all' ? 'white' : colors.primary }
              ]}
            >
              Tutte
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              { 
                backgroundColor: activeFilter === 'unread' ? colors.primary : 'transparent',
                borderColor: colors.primary,
              }
            ]}
            onPress={() => setActiveFilter('unread')}
          >
            <Text 
              style={[
                styles.filterText, 
                { color: activeFilter === 'unread' ? 'white' : colors.primary }
              ]}
            >
              Non lette {unreadCount > 0 && `(${unreadCount})`}
            </Text>
          </TouchableOpacity>
        </View>
        
        {unreadCount > 0 && (
          <TouchableOpacity
            style={[styles.markAllButton, { borderColor: colors.border }]}
            onPress={markAllAsRead}
          >
            <Text style={[styles.markAllText, { color: colors.primary }]}>
              Segna tutte come lette
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  // Renderizza il messaggio quando non ci sono notifiche
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-off" size={64} color={colors.subtext} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Nessuna notifica
        </Text>
        <Text style={[styles.emptyMessage, { color: colors.subtext }]}>
          {activeFilter === 'unread' 
            ? 'Non hai notifiche non lette al momento'
            : 'Non hai ancora ricevuto notifiche'
          }
        </Text>
      </View>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <FlatList
        data={getFilteredNotifications()}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.notificationsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
      
      {loading && (
        <View style={[styles.loadingContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  markAllButton: {
    paddingVertical: 8,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notificationsList: {
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderLeftWidth: 3,
  },
  notificationIconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationsScreen; 