import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Image, 
  ScrollView, 
  Switch,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  FlatList,
  Pressable,
  ImageBackground
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
// Commentiamo temporaneamente l'import di BlurView fino a quando non sarà disponibile
// import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 90 : 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// Definizione dei tipi per i dati
interface Post {
  id: number;
  imageUrl: string;
  likes: number;
  comments: number;
}

interface Activity {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'coin';
  user: string;
  content: string;
  time: string;
  avatar: string;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const scrollY = useRef(new Animated.Value(0)).current;

  // Funzione per gestire il logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Sei sicuro di voler uscire?',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            signOut();
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  // Funzione per mostrare/nascondere il menu delle impostazioni
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Dati fittizi per la griglia di post
  const dummyPosts = Array(12).fill(null).map((_, index) => ({
    id: index,
    imageUrl: `https://picsum.photos/500/500?random=${index}`,
    likes: Math.floor(Math.random() * 1000),
    comments: Math.floor(Math.random() * 100),
  }));

  // Dati fittizi per le attività
  const dummyActivities: Activity[] = [
    {
      id: '1',
      type: 'like',
      user: 'Marco Verdi',
      content: 'ha messo mi piace al tuo post',
      time: '2 ore fa',
      avatar: 'https://ui-avatars.com/api/?name=Marco+Verdi&background=random',
    },
    {
      id: '2',
      type: 'comment',
      user: 'Giulia Bianchi',
      content: 'ha commentato il tuo post',
      time: '5 ore fa',
      avatar: 'https://ui-avatars.com/api/?name=Giulia+Bianchi&background=random',
    },
    {
      id: '3',
      type: 'follow',
      user: 'Luca Rossi',
      content: 'ha iniziato a seguirti',
      time: '1 giorno fa',
      avatar: 'https://ui-avatars.com/api/?name=Luca+Rossi&background=random',
    },
    {
      id: '4',
      type: 'coin',
      user: 'Alessandro Neri',
      content: 'ti ha inviato 0.5 SocialCoin',
      time: '2 giorni fa',
      avatar: 'https://ui-avatars.com/api/?name=Alessandro+Neri&background=random',
    },
  ];

  // Dati fittizi per i badge
  const dummyBadges = [
    {
      id: '1',
      name: 'Early Adopter',
      icon: 'rocket',
      color: '#FF6B6B',
    },
    {
      id: '2',
      name: 'Top Creator',
      icon: 'crown',
      color: '#FFD93D',
    },
    {
      id: '3',
      name: 'Verified',
      icon: 'check-circle',
      color: '#4ECDC4',
    },
  ];

  // Animazioni per l'header
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const titleTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [60, 30, 0],
    extrapolate: 'clamp',
  });

  const avatarSize = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [100, 40],
    extrapolate: 'clamp',
  });

  const avatarTranslateX = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  });

  const avatarTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0],
    extrapolate: 'clamp',
  });

  // Renderizza un post
  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.postItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      <View style={[styles.postOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
        <View style={styles.postStats}>
          <View style={styles.postStat}>
            <Ionicons name="heart" size={16} color="white" />
            <Text style={styles.postStatText}>{item.likes}</Text>
          </View>
          <View style={styles.postStat}>
            <Ionicons name="chatbubble" size={16} color="white" />
            <Text style={styles.postStatText}>{item.comments}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Renderizza un'attività
  const renderActivity = ({ item }: { item: Activity }) => (
    <View style={[styles.activityItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Image source={{ uri: item.avatar }} style={styles.activityAvatar} />
      <View style={styles.activityContent}>
        <Text style={[styles.activityText, { color: colors.text }]}>
          <Text style={styles.activityUser}>{item.user}</Text> {item.content}
        </Text>
        <Text style={[styles.activityTime, { color: colors.subtext }]}>{item.time}</Text>
      </View>
      {item.type === 'follow' && (
        <TouchableOpacity style={[styles.followButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.followButtonText}>Segui</Text>
        </TouchableOpacity>
      )}
      {item.type === 'coin' && (
        <View style={[styles.coinBadge, { backgroundColor: colors.primary }]}>
          <Ionicons name="logo-bitcoin" size={14} color="white" />
        </View>
      )}
    </View>
  );

  // Renderizza un badge
  const renderBadge = ({ item }: { item: Badge }) => (
    <View style={[styles.badgeItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.badgeIcon, { backgroundColor: item.color }]}>
        <FontAwesome5 name={item.icon} size={20} color="white" />
      </View>
      <Text style={[styles.badgeName, { color: colors.text }]}>{item.name}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar translucent backgroundColor="transparent" />
      
      {/* Header animato */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            height: headerHeight,
            backgroundColor: colors.card,
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.headerBackground,
            { opacity: headerOpacity }
          ]}
        >
          <ImageBackground
            source={{ uri: 'https://picsum.photos/800/800' }}
            style={styles.headerImage}
          >
            <View style={styles.headerOverlay} />
            {/* Commentiamo temporaneamente il BlurView fino a quando non sarà disponibile */}
            {/* {Platform.OS === 'ios' && (
              <BlurView intensity={20} style={styles.blurView} tint={isDarkMode ? 'dark' : 'light'} />
            )} */}
          </ImageBackground>
        </Animated.View>
        
        {/* Titolo animato */}
        <Animated.View 
          style={[
            styles.headerTitle,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslate }],
            }
          ]}
        >
          <Text style={[styles.headerTitleText, { color: colors.text }]}>
            {user?.username || 'Utente'}
          </Text>
        </Animated.View>
        
        {/* Avatar animato */}
        <Animated.View 
          style={[
            styles.avatarContainer,
            {
              transform: [
                { translateX: avatarTranslateX },
                { translateY: avatarTranslateY }
              ],
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.avatarOuterContainer,
              { 
                borderColor: colors.background,
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize,
              }
            ]}
          >
            <Image
              source={{ uri: 'https://ui-avatars.com/api/?name=' + (user?.username || 'User') + '&background=random&size=200' }}
              style={styles.avatar}
            />
          </Animated.View>
        </Animated.View>
        
        {/* Pulsanti header */}
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={() => Alert.alert('Modifica profilo', 'Funzionalità in arrivo')}
          >
            <Text style={styles.editButtonText}>Modifica</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingsButton, { backgroundColor: colors.card }]}
            onPress={toggleSettings}
          >
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Menu impostazioni */}
      {showSettings && (
        <View style={[styles.settingsMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingsItem}>
            <View style={styles.settingRow}>
              <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color={colors.primary} />
              <Text style={[styles.settingsItemText, { color: colors.text }]}>Modalità scura</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={isDarkMode ? '#f4f3f4' : '#f4f3f4'}
            />
          </View>
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => Alert.alert('Privacy', 'Funzionalità in arrivo')}
          >
            <View style={styles.settingRow}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.text} />
              <Text style={[styles.settingsItemText, { color: colors.text }]}>Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => Alert.alert('Notifiche', 'Funzionalità in arrivo')}
          >
            <View style={styles.settingRow}>
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
              <Text style={[styles.settingsItemText, { color: colors.text }]}>Notifiche</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
          </TouchableOpacity>
          <View style={[styles.settingsDivider, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.settingsItem} onPress={handleLogout}>
            <View style={styles.settingRow}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.settingsItemText, { color: colors.error }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
      
      <Animated.ScrollView
        contentContainerStyle={styles.scrollViewContent}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Info utente */}
        <View style={styles.userInfoContainer}>
          <Text style={[styles.username, { color: colors.text }]}>{user?.username || 'Utente'}</Text>
          <Text style={[styles.email, { color: colors.subtext }]}>{user?.email || 'email@example.com'}</Text>
          
          <View style={styles.bioContainer}>
            <Text style={[styles.bio, { color: colors.text }]}>
              Benvenuto nel mio profilo SocialCoin! Qui puoi vedere i miei post e le mie attività.
            </Text>
          </View>
          
          {/* Badge utente */}
          <FlatList
            data={dummyBadges}
            renderItem={renderBadge}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesList}
          />
        </View>
        
        {/* Statistiche */}
        <View style={[styles.statsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{user?.coins || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>Coin</Text>
          </Pressable>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <Pressable style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>42</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>Post</Text>
          </Pressable>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <Pressable style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>128</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>Seguaci</Text>
          </Pressable>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <Pressable style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>56</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>Seguiti</Text>
          </Pressable>
        </View>
        
        {/* Tabs */}
        <View style={[styles.tabsContainer, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <TouchableOpacity 
            style={[
              styles.tabItem, 
              activeTab === 'posts' && [styles.activeTab, { borderBottomColor: colors.primary }]
            ]}
            onPress={() => setActiveTab('posts')}
          >
            <Feather 
              name="grid" 
              size={22} 
              color={activeTab === 'posts' ? colors.primary : colors.subtext} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'posts' ? colors.primary : colors.subtext }
              ]}
            >
              Post
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabItem, 
              activeTab === 'activity' && [styles.activeTab, { borderBottomColor: colors.primary }]
            ]}
            onPress={() => setActiveTab('activity')}
          >
            <Feather 
              name="activity" 
              size={22} 
              color={activeTab === 'activity' ? colors.primary : colors.subtext} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'activity' ? colors.primary : colors.subtext }
              ]}
            >
              Attività
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabItem, 
              activeTab === 'saved' && [styles.activeTab, { borderBottomColor: colors.primary }]
            ]}
            onPress={() => setActiveTab('saved')}
          >
            <Feather 
              name="bookmark" 
              size={22} 
              color={activeTab === 'saved' ? colors.primary : colors.subtext} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'saved' ? colors.primary : colors.subtext }
              ]}
            >
              Salvati
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Contenuto del tab attivo */}
        {activeTab === 'posts' && (
          <FlatList
            data={dummyPosts}
            renderItem={renderPost}
            keyExtractor={item => item.id.toString()}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.postsGrid}
          />
        )}
        
        {activeTab === 'activity' && (
          <FlatList
            data={dummyActivities}
            renderItem={renderActivity}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.activitiesList}
          />
        )}
        
        {activeTab === 'saved' && (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="bookmark" size={60} color={colors.subtext} />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>
              Non hai ancora salvato nessun post
            </Text>
            <TouchableOpacity 
              style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Home' as never)}
            >
              <Text style={styles.emptyStateButtonText}>Esplora</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 10,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  headerTitle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 70,
    right: 0,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  avatarOuterContainer: {
    borderWidth: 4,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  headerButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsMenu: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    right: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    width: 200,
    borderWidth: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemText: {
    marginLeft: 8,
    fontSize: 16,
  },
  settingsDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  scrollViewContent: {
    paddingTop: HEADER_MAX_HEIGHT,
    paddingBottom: 20,
  },
  userInfoContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    marginTop: 2,
  },
  bioContainer: {
    marginTop: 12,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
  },
  badgesList: {
    marginTop: 15,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  badgeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  postItem: {
    width: width / 3,
    height: width / 3,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    opacity: 0,
  },
  postStats: {
    flexDirection: 'row',
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  postStatText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  activitiesList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityText: {
    fontSize: 14,
  },
  activityUser: {
    fontWeight: 'bold',
  },
  activityTime: {
    fontSize: 12,
    marginTop: 2,
  },
  followButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  coinBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default ProfileScreen; 