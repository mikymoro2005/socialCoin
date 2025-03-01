import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../navigation/types';

// Tipi per i risultati di ricerca
interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  followers: number;
  verified?: boolean;
}

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
}

interface Hashtag {
  id: string;
  name: string;
  postsCount: number;
}

type SearchResult = User | Post | Hashtag;
type SearchResultType = 'user' | 'post' | 'hashtag';

// Dati di esempio
const DUMMY_USERS: User[] = [
  {
    id: '101',
    username: 'mario_rossi',
    name: 'Mario Rossi',
    avatar: 'https://ui-avatars.com/api/?name=Mario+Rossi&background=random',
    followers: 1250,
    verified: true,
  },
  {
    id: '102',
    username: 'laura_bianchi',
    name: 'Laura Bianchi',
    avatar: 'https://ui-avatars.com/api/?name=Laura+Bianchi&background=random',
    followers: 850,
  },
  {
    id: '103',
    username: 'marco_verdi',
    name: 'Marco Verdi',
    avatar: 'https://ui-avatars.com/api/?name=Marco+Verdi&background=random',
    followers: 3200,
    verified: true,
  },
  {
    id: '104',
    username: 'giulia_neri',
    name: 'Giulia Neri',
    avatar: 'https://ui-avatars.com/api/?name=Giulia+Neri&background=random',
    followers: 1800,
  },
  {
    id: '105',
    username: 'alessandro_blu',
    name: 'Alessandro Blu',
    avatar: 'https://ui-avatars.com/api/?name=Alessandro+Blu&background=random',
    followers: 920,
  },
];

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
  },
];

const DUMMY_HASHTAGS: Hashtag[] = [
  {
    id: '1',
    name: 'socialcoin',
    postsCount: 1250,
  },
  {
    id: '2',
    name: 'crypto',
    postsCount: 8500,
  },
  {
    id: '3',
    name: 'blockchain',
    postsCount: 5200,
  },
  {
    id: '4',
    name: 'web3',
    postsCount: 3800,
  },
  {
    id: '5',
    name: 'nft',
    postsCount: 9200,
  },
];

type SearchScreenNavigationProp = NativeStackNavigationProp<MainTabParamList>;

const SearchScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<SearchScreenNavigationProp>();
  
  // Stati
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [resultType, setResultType] = useState<SearchResultType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'users' | 'posts' | 'hashtags'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'socialcoin', 'crypto', 'blockchain', 'mario_rossi'
  ]);
  
  // Effettua la ricerca quando cambia la query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setResultType(null);
      return;
    }
    
    const delaySearch = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [searchQuery, activeFilter]);
  
  // Funzione per effettuare la ricerca
  const performSearch = (query: string) => {
    setIsLoading(true);
    
    // Simula una chiamata API con un ritardo
    setTimeout(() => {
      let results: SearchResult[] = [];
      const lowerQuery = query.toLowerCase();
      
      // Filtra in base al tipo attivo
      if (activeFilter === 'all' || activeFilter === 'users') {
        const filteredUsers = DUMMY_USERS.filter(
          user => 
            user.username.toLowerCase().includes(lowerQuery) || 
            user.name.toLowerCase().includes(lowerQuery)
        );
        results = [...results, ...filteredUsers];
      }
      
      if (activeFilter === 'all' || activeFilter === 'posts') {
        const filteredPosts = DUMMY_POSTS.filter(
          post => post.content.toLowerCase().includes(lowerQuery)
        );
        results = [...results, ...filteredPosts];
      }
      
      if (activeFilter === 'all' || activeFilter === 'hashtags') {
        const filteredHashtags = DUMMY_HASHTAGS.filter(
          hashtag => hashtag.name.toLowerCase().includes(lowerQuery)
        );
        results = [...results, ...filteredHashtags];
      }
      
      setSearchResults(results);
      setIsLoading(false);
      
      // Determina il tipo di risultato predominante
      if (results.length > 0) {
        if (results[0] as User && 'username' in results[0]) {
          setResultType('user');
        } else if (results[0] as Post && 'content' in results[0]) {
          setResultType('post');
        } else {
          setResultType('hashtag');
        }
      } else {
        setResultType(null);
      }
    }, 500);
  };
  
  // Gestisce il tap su una ricerca recente
  const handleRecentSearchTap = (search: string) => {
    setSearchQuery(search);
    performSearch(search);
  };
  
  // Gestisce il tap su un risultato
  const handleResultTap = (result: SearchResult) => {
    // Aggiungi alla cronologia delle ricerche recenti
    if ('username' in result) {
      // È un utente
      if (!recentSearches.includes(result.username)) {
        setRecentSearches([result.username, ...recentSearches.slice(0, 4)]);
      }
      
      // Qui navigheremmo al profilo dell'utente
      console.log(`Navigazione al profilo di ${result.username}`);
    } else if ('content' in result) {
      // È un post
      // Qui navigheremmo al post
      console.log(`Navigazione al post ${result.id}`);
    } else {
      // È un hashtag
      if (!recentSearches.includes(result.name)) {
        setRecentSearches([result.name, ...recentSearches.slice(0, 4)]);
      }
      
      // Qui navigheremmo alla pagina dell'hashtag
      console.log(`Navigazione all'hashtag #${result.name}`);
    }
    
    // Chiudi la tastiera
    Keyboard.dismiss();
  };
  
  // Cancella la cronologia delle ricerche recenti
  const clearRecentSearches = () => {
    setRecentSearches([]);
  };
  
  // Renderizza un elemento della lista dei risultati
  const renderResultItem = ({ item }: { item: SearchResult }) => {
    // Utente
    if ('username' in item) {
      return (
        <TouchableOpacity
          style={[styles.resultItem, { borderBottomColor: colors.border }]}
          onPress={() => handleResultTap(item)}
        >
          <Image source={{ uri: item.avatar }} style={styles.resultAvatar} />
          
          <View style={styles.resultContent}>
            <View style={styles.resultNameContainer}>
              <Text style={[styles.resultName, { color: colors.text }]}>
                {item.name}
              </Text>
              {item.verified && (
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={styles.verifiedIcon} />
              )}
            </View>
            
            <Text style={[styles.resultUsername, { color: colors.subtext }]}>
              @{item.username}
            </Text>
            
            <Text style={[styles.resultMeta, { color: colors.subtext }]}>
              {item.followers.toLocaleString()} follower
            </Text>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
        </TouchableOpacity>
      );
    }
    
    // Post
    if ('content' in item) {
      return (
        <TouchableOpacity
          style={[styles.resultItem, { borderBottomColor: colors.border }]}
          onPress={() => handleResultTap(item)}
        >
          <Image source={{ uri: item.user.avatar }} style={styles.resultAvatar} />
          
          <View style={styles.resultContent}>
            <Text style={[styles.resultUsername, { color: colors.subtext }]}>
              @{item.user.username}
            </Text>
            
            <Text style={[styles.resultPostContent, { color: colors.text }]} numberOfLines={2}>
              {item.content}
            </Text>
            
            <View style={styles.resultPostStats}>
              <Ionicons name="heart-outline" size={14} color={colors.subtext} />
              <Text style={[styles.resultPostStat, { color: colors.subtext }]}>
                {item.likes}
              </Text>
              
              <Ionicons name="chatbubble-outline" size={14} color={colors.subtext} style={styles.statIcon} />
              <Text style={[styles.resultPostStat, { color: colors.subtext }]}>
                {item.comments}
              </Text>
            </View>
          </View>
          
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.resultPostImage} />
          )}
        </TouchableOpacity>
      );
    }
    
    // Hashtag
    return (
      <TouchableOpacity
        style={[styles.resultItem, { borderBottomColor: colors.border }]}
        onPress={() => handleResultTap(item)}
      >
        <View style={[styles.hashtagIcon, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.hashtagIconText, { color: colors.primary }]}>#</Text>
        </View>
        
        <View style={styles.resultContent}>
          <Text style={[styles.resultHashtag, { color: colors.text }]}>
            #{item.name}
          </Text>
          
          <Text style={[styles.resultMeta, { color: colors.subtext }]}>
            {item.postsCount.toLocaleString()} post
          </Text>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
      </TouchableOpacity>
    );
  };
  
  // Renderizza i filtri
  const renderFilters = () => {
    return (
      <View style={styles.filtersContainer}>
        <ScrollableFilter 
          title="Tutti" 
          active={activeFilter === 'all'} 
          onPress={() => setActiveFilter('all')} 
          icon="grid-outline"
          colors={colors}
        />
        <ScrollableFilter 
          title="Utenti" 
          active={activeFilter === 'users'} 
          onPress={() => setActiveFilter('users')} 
          icon="people-outline"
          colors={colors}
        />
        <ScrollableFilter 
          title="Post" 
          active={activeFilter === 'posts'} 
          onPress={() => setActiveFilter('posts')} 
          icon="document-text-outline"
          colors={colors}
        />
        <ScrollableFilter 
          title="Hashtag" 
          active={activeFilter === 'hashtags'} 
          onPress={() => setActiveFilter('hashtags')} 
          icon="pricetag-outline"
          colors={colors}
        />
      </View>
    );
  };
  
  // Componente per i filtri
  const ScrollableFilter = ({ 
    title, 
    active, 
    onPress, 
    icon,
    colors
  }: { 
    title: string; 
    active: boolean; 
    onPress: () => void; 
    icon: keyof typeof Ionicons.glyphMap;
    colors: any;
  }) => {
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          { 
            backgroundColor: active ? colors.primary : colors.card,
            borderColor: active ? colors.primary : colors.border,
          }
        ]}
        onPress={onPress}
      >
        <Ionicons 
          name={icon} 
          size={16} 
          color={active ? 'white' : colors.text} 
          style={styles.filterIcon}
        />
        <Text 
          style={[
            styles.filterText, 
            { color: active ? 'white' : colors.text }
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Renderizza le ricerche recenti
  const renderRecentSearches = () => {
    if (recentSearches.length === 0) return null;
    
    return (
      <View style={styles.recentSearchesContainer}>
        <View style={styles.recentSearchesHeader}>
          <Text style={[styles.recentSearchesTitle, { color: colors.text }]}>
            Ricerche recenti
          </Text>
          
          <TouchableOpacity onPress={clearRecentSearches}>
            <Text style={[styles.clearButton, { color: colors.primary }]}>
              Cancella
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.recentSearchesList}>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.recentSearchItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleRecentSearchTap(search)}
            >
              <Ionicons name="time-outline" size={16} color={colors.subtext} style={styles.recentSearchIcon} />
              <Text style={[styles.recentSearchText, { color: colors.text }]}>
                {search}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header di ricerca */}
      <View style={[styles.searchHeader, { backgroundColor: colors.card }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.subtext} style={styles.searchIcon} />
          
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cerca utenti, post, hashtag..."
            placeholderTextColor={colors.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
          />
          
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color={colors.subtext} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Filtri */}
      {renderFilters()}
      
      {/* Risultati della ricerca o ricerche recenti */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : searchQuery.trim() === '' ? (
        // Mostra le ricerche recenti se non c'è una query
        renderRecentSearches()
      ) : searchResults.length === 0 ? (
        // Nessun risultato trovato
        <View style={styles.emptyResultsContainer}>
          <Ionicons name="search-outline" size={64} color={colors.subtext} />
          <Text style={[styles.emptyResultsText, { color: colors.text }]}>
            Nessun risultato trovato per "{searchQuery}"
          </Text>
          <Text style={[styles.emptyResultsSubtext, { color: colors.subtext }]}>
            Prova a cercare qualcos'altro o cambia i filtri
          </Text>
        </View>
      ) : (
        // Mostra i risultati della ricerca
        <FlatList
          data={searchResults}
          renderItem={renderResultItem}
          keyExtractor={(item) => {
            if ('username' in item) return `user-${item.id}`;
            if ('content' in item) return `post-${item.id}`;
            return `hashtag-${item.id}`;
          }}
          contentContainerStyle={styles.resultsList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    padding: 16,
    paddingTop: 60, // Padding aggiuntivo per evitare la Dynamic Island
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  clearSearchButton: {
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  resultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  resultContent: {
    flex: 1,
    marginLeft: 12,
  },
  resultNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  resultUsername: {
    fontSize: 14,
    marginTop: 2,
  },
  resultMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  resultPostContent: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  resultPostStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  resultPostStat: {
    fontSize: 12,
    marginLeft: 4,
  },
  statIcon: {
    marginLeft: 12,
  },
  resultPostImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 12,
  },
  hashtagIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hashtagIconText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resultHashtag: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyResultsSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  recentSearchesContainer: {
    padding: 16,
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentSearchesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    fontSize: 14,
  },
  recentSearchesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  recentSearchIcon: {
    marginRight: 6,
  },
  recentSearchText: {
    fontSize: 14,
  },
});

export default SearchScreen; 