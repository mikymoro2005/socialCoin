import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../navigation/types';
import { useNotifications } from '../context/NotificationContext';

// Tipo per i post
interface Post {
  id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  createdAt: string;
  liked: boolean;
  isPremium?: boolean;
  hideComments?: boolean;
}

// Tipo per le storie
interface Story {
  id: string;
  username: string;
  avatar: string;
  add?: boolean;
}

// Dati di esempio per i post
const DUMMY_POSTS: Post[] = [
  {
    id: '1',
    user: {
      id: '101',
      username: 'mario_rossi',
      avatar: 'https://ui-avatars.com/api/?name=Mario+Rossi&background=random',
    },
    content: 'Ho appena scoperto questa nuova app SocialCoin! Sembra molto interessante poter guadagnare token interagendo con i contenuti.',
    image: 'https://picsum.photos/seed/post1/600/400',
    likes: 24,
    comments: 5,
    createdAt: '2025-01-02T14:30:00Z',
    liked: false,
    hideComments: false,
  },
  {
    id: '2',
    user: {
      id: '102',
      username: 'laura_bianchi',
      avatar: 'https://ui-avatars.com/api/?name=Laura+Bianchi&background=random',
    },
    content: 'Oggi ho ricevuto 50 SocialCoin per un mio post! Qualcuno sa come posso utilizzarli al meglio?',
    likes: 18,
    comments: 12,
    createdAt: '2025-01-02T12:15:00Z',
    liked: true,
    hideComments: true,
  },
  {
    id: '3',
    user: {
      id: '103',
      username: 'marco_verdi',
      avatar: 'https://ui-avatars.com/api/?name=Marco+Verdi&background=random',
    },
    content: 'Ho appena pubblicato un nuovo articolo sul mio blog riguardo le criptovalute e i token social. Fatemi sapere cosa ne pensate!',
    image: 'https://picsum.photos/seed/post3/600/400',
    likes: 42,
    comments: 8,
    createdAt: '2025-01-02T10:00:00Z',
    liked: false,
    isPremium: true,
    hideComments: false,
  },
  {
    id: '4',
    user: {
      id: '104',
      username: 'giulia_neri',
      avatar: 'https://ui-avatars.com/api/?name=Giulia+Neri&background=random',
    },
    content: 'Qualcuno ha suggerimenti su come guadagnare più SocialCoin? Sto cercando di aumentare il mio saldo per sbloccare nuove funzionalità.',
    likes: 15,
    comments: 23,
    createdAt: '2025-01-01T22:45:00Z',
    liked: false,
    hideComments: false,
  },
  {
    id: '5',
    user: {
      id: '105',
      username: 'alessandro_blu',
      avatar: 'https://ui-avatars.com/api/?name=Alessandro+Blu&background=random',
    },
    content: 'Ho appena convertito alcuni SocialCoin in buoni regalo! Il processo è stato molto semplice e veloce.',
    image: 'https://picsum.photos/seed/post5/600/400',
    likes: 31,
    comments: 4,
    createdAt: '2025-01-01T18:20:00Z',
    liked: true,
    isPremium: true,
    hideComments: true,
  },
];

type HomeScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Home'>;

const HomeScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { unreadCount } = useNotifications();
  const [posts, setPosts] = useState<Post[]>(DUMMY_POSTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [userCoins, setUserCoins] = useState<number>(user?.coins || 100); // Valore di default per test

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

  // Funzione per gestire il like di un post
  const handleLike = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const newLiked = !post.liked;
          
          // In un'implementazione reale, qui chiameremmo l'API per:
          // 1. Aggiornare lo stato del like
          // 2. Aggiornare i coin dell'autore del post (non dell'utente che mette like)
          
          // Nota: in un'app reale, l'autore del post guadagnerebbe i coin, non chi mette like
          // Qui non modifichiamo i coin dell'utente corrente perché non è lui a guadagnarli
          
          return {
            ...post,
            liked: newLiked,
            likes: newLiked ? post.likes + 1 : post.likes - 1
          };
        }
        return post;
      })
    );
  };

  // Funzione per gestire l'invio di un commento
  const handleComment = (postId: string) => {
    if (commentText.trim() === '') return;
    
    const post = posts.find(p => p.id === postId);
    
    // Verifica se il post è premium e se l'utente ha abbastanza coin
    if (post?.isPremium) {
      if (userCoins < 0.05) {
        alert('Non hai abbastanza SocialCoin per commentare questo post premium!');
        return;
      }
      
      // Sottrai 0.05 coin all'utente
      setUserCoins(prev => prev - 0.05);
      // In un'implementazione reale, qui chiameremmo l'API per aggiornare i coin dell'utente
    }
    
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments + 1
          };
        }
        return post;
      })
    );
    
    setCommentText('');
    setActiveCommentId(null);
  };

  // Funzione per mostrare/nascondere i commenti
  const toggleHideComments = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            hideComments: !post.hideComments
          };
        }
        return post;
      })
    );
  };

  // Funzione per verificare se l'utente corrente è l'autore del post
  const isPostAuthor = (postUserId: string) => {
    return user?.id === postUserId;
  };

  // Funzione per aggiornare i post
  const refreshPosts = async () => {
    setRefreshing(true);
    // In una implementazione reale, qui chiameremmo l'API per ottenere i post più recenti
    // Per ora, simuliamo un ritardo
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Aggiungi questa funzione per navigare alla schermata delle notifiche
  const goToNotifications = () => {
    navigation.navigate('Notifications');
  };

  // Renderizza un singolo post
  const renderPost = ({ item }: { item: Post }) => {
    const isCommentActive = activeCommentId === item.id;
    const canViewHiddenComments = isPostAuthor(item.user.id);
    
    return (
      <View style={[styles.postContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Header del post */}
        <View style={styles.postHeader}>
          <TouchableOpacity>
            <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
          </TouchableOpacity>
          <View style={styles.postHeaderInfo}>
            <TouchableOpacity>
              <Text style={[styles.username, { color: colors.text }]}>{item.user.username}</Text>
            </TouchableOpacity>
            <Text style={[styles.timestamp, { color: colors.subtext }]}>{formatDate(item.createdAt)}</Text>
          </View>
          {item.isPremium && (
            <View style={[styles.premiumBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="star" size={12} color="white" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>
        
        {/* Contenuto del post */}
        <Text style={[styles.postContent, { color: colors.text }]}>{item.content}</Text>
        
        {/* Immagine del post (se presente) */}
        {item.image && (
          <Image 
            source={{ uri: item.image }} 
            style={styles.postImage}
            resizeMode="cover"
          />
        )}
        
        {/* Statistiche del post */}
        <View style={styles.postStats}>
          <Text style={[styles.statsText, { color: colors.subtext }]}>
            {item.likes} mi piace • {item.comments} commenti
          </Text>
          {item.isPremium && (
            <Text style={[styles.premiumCommentText, { color: colors.primary }]}>
              Commento: 0.05 coin
            </Text>
          )}
        </View>
        
        {/* Azioni del post */}
        <View style={[styles.postActions, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleLike(item.id)}
          >
            <Ionicons 
              name={item.liked ? "heart" : "heart-outline"} 
              size={22} 
              color={item.liked ? "#e74c3c" : colors.text} 
            />
            <Text style={[styles.actionText, { color: colors.text }]}>Mi piace</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setActiveCommentId(isCommentActive ? null : item.id)}
          >
            <Ionicons name="chatbubble-outline" size={22} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>Commenta</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => toggleHideComments(item.id)}
          >
            <Ionicons 
              name={item.hideComments ? "eye-off-outline" : "eye-outline"} 
              size={22} 
              color={colors.text} 
            />
            <Text style={[styles.actionText, { color: colors.text }]}>
              {item.hideComments ? "Mostra" : "Nascondi"}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Area commenti (se attiva) */}
        {isCommentActive && (
          <View style={styles.commentArea}>
            {item.hideComments && !canViewHiddenComments && (
              <Text style={[styles.hiddenCommentsText, { color: colors.subtext }]}>
                I commenti sono stati nascosti dall'autore del post
              </Text>
            )}
            
            <View style={[styles.commentInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Image 
                source={{ uri: user?.username ? `https://ui-avatars.com/api/?name=${user.username}&background=random` : 'https://ui-avatars.com/api/?name=User&background=random' }} 
                style={styles.commentAvatar} 
              />
              <TextInput
                style={[styles.commentInput, { color: colors.text, backgroundColor: colors.background }]}
                placeholder={item.isPremium ? "Commento premium (0.05 coin)" : "Scrivi un commento..."}
                placeholderTextColor={colors.subtext}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity 
                style={[styles.sendButton, { opacity: commentText.trim() ? 1 : 0.5 }]}
                onPress={() => handleComment(item.id)}
                disabled={!commentText.trim()}
              >
                <Ionicons name="send" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            {/* Mostra il saldo attuale */}
            <View style={styles.coinBalanceContainer}>
              <Ionicons name="wallet-outline" size={14} color={colors.subtext} />
              <Text style={[styles.coinBalanceText, { color: colors.subtext }]}>
                Saldo: {userCoins.toFixed(2)} coin
              </Text>
              {item.liked && (
                <Text style={[styles.coinRewardText, { color: colors.primary }]}>
                  +0.01 coin per il tuo like!
                </Text>
              )}
            </View>
            
            {/* Mostra i commenti solo se non sono nascosti o se l'utente è l'autore del post */}
            {(!item.hideComments || canViewHiddenComments) && (
              <View style={styles.commentsContainer}>
                <Text style={[styles.commentsTitle, { color: colors.text }]}>
                  Commenti ({item.comments})
                </Text>
                {/* Qui verrebbero visualizzati i commenti effettivi in un'implementazione reale */}
                {/* Per ora mostriamo solo un messaggio di esempio */}
                <View style={styles.commentItem}>
                  <Image 
                    source={{ uri: 'https://ui-avatars.com/api/?name=Utente+Esempio&background=random' }} 
                    style={styles.commentAvatar} 
                  />
                  <View style={styles.commentContent}>
                    <Text style={[styles.commentUsername, { color: colors.text }]}>utente_esempio</Text>
                    <Text style={[styles.commentText, { color: colors.text }]}>
                      Questo è un commento di esempio. In un'implementazione reale, qui verrebbero mostrati i commenti effettivi degli utenti.
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header con logo e pulsante notifiche */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: colors.primary }]}>Social</Text>
          <Text style={[styles.logoTextAccent, { color: colors.text }]}>Coin</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={goToNotifications}
        >
          <Ionicons name="notifications" size={24} color={colors.primary} />
          {unreadCount > 0 && (
            <View style={[styles.notificationBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshPosts}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={[styles.storyContainer, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Storie</Text>
            <FlatList
              horizontal
              data={[
                { id: 'add', username: 'La tua storia', avatar: user?.username ? `https://ui-avatars.com/api/?name=${user.username}&background=random` : 'https://ui-avatars.com/api/?name=User&background=random', add: true },
                ...DUMMY_POSTS.map(post => ({ id: post.id, username: post.user.username, avatar: post.user.avatar }))
              ] as Story[]}
              renderItem={({ item }: { item: Story }) => (
                <TouchableOpacity style={styles.storyItem}>
                  <View style={[styles.storyAvatarContainer, { borderColor: item.add ? colors.background : colors.primary }]}>
                    <Image source={{ uri: item.avatar }} style={styles.storyAvatar} />
                    {item.add && (
                      <View style={[styles.addStoryButton, { backgroundColor: colors.primary }]}>
                        <Ionicons name="add" size={18} color="white" />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.storyUsername, { color: colors.text }]} numberOfLines={1}>
                    {item.username}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storyList}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={80} color={colors.subtext} />
            <Text style={[styles.emptyText, { color: colors.text }]}>Nessun post disponibile</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  storyContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 12,
  },
  storyList: {
    paddingLeft: 16,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  storyAvatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    padding: 2,
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
  },
  addStoryButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyUsername: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  postContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postHeaderInfo: {
    marginLeft: 12,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
  },
  postContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    fontSize: 15,
    lineHeight: 20,
  },
  postImage: {
    width: '100%',
    height: 300,
  },
  postStats: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statsText: {
    fontSize: 13,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
  },
  commentArea: {
    padding: 12,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  commentInput: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 6,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    padding: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  premiumText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  premiumCommentText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  hiddenCommentsText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 10,
    fontSize: 13,
  },
  coinBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  coinBalanceText: {
    fontSize: 12,
    marginLeft: 4,
  },
  coinRewardText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  commentsContainer: {
    marginTop: 16,
  },
  commentsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentContent: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 8,
  },
  commentUsername: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoTextAccent: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationButton: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 