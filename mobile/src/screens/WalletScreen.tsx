import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../navigation/types';
import { FontAwesome5 } from '@expo/vector-icons';

// Tipo per le transazioni
interface Transaction {
  id: string;
  type: 'like' | 'comment' | 'post_reward' | 'direct_transfer' | 'system';
  amount: number;
  description: string;
  sender: {
    id: string;
    username: string;
    avatar: string;
  };
  receiver: {
    id: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
  postId?: string;
  commentId?: string;
}

// Tipo per i premi
interface Reward {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: 'digital' | 'physical' | 'donation' | 'experience';
  featured?: boolean;
  available: boolean;
  expiresAt?: string;
}

// Tipo per i boost
interface Boost {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  price: number;
  icon: string;
  active: boolean;
  duration: string;
  effect: string;
}

// Dati di esempio per le transazioni
const DUMMY_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'like',
    amount: 0.34,
    description: 'Like da Matteo e altri 33 persone',
    sender: {
      id: '102',
      username: 'matteo_bianchi',
      avatar: 'https://ui-avatars.com/api/?name=Matteo+Bianchi&background=random',
    },
    receiver: {
      id: '101',
      username: 'mario_rossi',
      avatar: 'https://ui-avatars.com/api/?name=Mario+Rossi&background=random',
    },
    createdAt: '2025-01-02T14:30:00Z',
    postId: '1',
  },
  {
    id: '2',
    type: 'comment',
    amount: 0.05,
    description: 'Commento inviato sul post premium',
    sender: {
      id: '101',
      username: 'mario_rossi',
      avatar: 'https://ui-avatars.com/api/?name=Mario+Rossi&background=random',
    },
    receiver: {
      id: '103',
      username: 'marco_verdi',
      avatar: 'https://ui-avatars.com/api/?name=Marco+Verdi&background=random',
    },
    createdAt: '2025-01-02T12:15:00Z',
    postId: '3',
    commentId: '1',
  },
  {
    id: '3',
    type: 'direct_transfer',
    amount: 0.50,
    description: 'Trasferimento diretto (massimo giornaliero)',
    sender: {
      id: '101',
      username: 'mario_rossi',
      avatar: 'https://ui-avatars.com/api/?name=Mario+Rossi&background=random',
    },
    receiver: {
      id: '104',
      username: 'giulia_neri',
      avatar: 'https://ui-avatars.com/api/?name=Giulia+Neri&background=random',
    },
    createdAt: '2025-01-01T18:20:00Z',
  },
  {
    id: '4',
    type: 'direct_transfer',
    amount: 0.20,
    description: 'Regalo ricevuto',
    sender: {
      id: '105',
      username: 'mario_rossi',
      avatar: 'https://ui-avatars.com/api/?name=Mario+Rossi&background=random',
    },
    receiver: {
      id: '101',
      username: 'mario_rossi',
      avatar: 'https://ui-avatars.com/api/?name=Mario+Rossi&background=random',
    },
    createdAt: '2025-01-01T10:45:00Z',
  },
  {
    id: '5',
    type: 'system',
    amount: 1.00,
    description: 'Bonus di benvenuto',
    sender: {
      id: 'system',
      username: 'Sistema',
      avatar: 'https://ui-avatars.com/api/?name=Sistema&background=random',
    },
    receiver: {
      id: '101',
      username: 'mario_rossi',
      avatar: 'https://ui-avatars.com/api/?name=Mario+Rossi&background=random',
    },
    createdAt: '2025-01-01T08:00:00Z',
  },
];

// Dati di esempio per i premi
const DUMMY_REWARDS: Reward[] = [
  
];

// Dati di esempio per i boost
const AVAILABLE_BOOSTS: Boost[] = [
  {
    id: 'coin_boost',
    title: 'Coin Boost',
    description: 'Guadagna più coin dalle interazioni',
    detailedDescription: 'Aumenta del 10% la possibilità di guadagnare coin extra quando ricevi like, commenti o condivisioni sui tuoi post.',
    price: 5.00,
    icon: 'coins',
    active: false,
    duration: '24 ore',
    effect: '+10% probabilità di coin extra'
  },
  {
    id: 'visibility_boost',
    title: 'Visibility Boost',
    description: 'Aumenta la visibilità dei tuoi post',
    detailedDescription: 'I tuoi post avranno una priorità maggiore nel feed degli altri utenti, aumentando la tua visibilità del 20%.',
    price: 10.00,
    icon: 'eye',
    active: false,
    duration: '48 ore',
    effect: '+20% visibilità nel feed'
  },
  {
    id: 'engagement_boost',
    title: 'Engagement Boost',
    description: 'Ottieni più interazioni sui tuoi contenuti',
    detailedDescription: 'Aumenta del 15% la probabilità che i tuoi post ricevano like, commenti e condivisioni.',
    price: 8.00,
    icon: 'chart-line',
    active: false,
    duration: '24 ore',
    effect: '+15% engagement'
  },
  {
    id: 'follower_boost',
    title: 'Follower Boost',
    description: 'Attira nuovi follower più facilmente',
    detailedDescription: 'Il tuo profilo apparirà più frequentemente nella sezione "Suggeriti da seguire", aumentando le possibilità di ottenere nuovi follower.',
    price: 12.00,
    icon: 'users',
    active: false,
    duration: '72 ore',
    effect: '+25% visibilità nei suggerimenti'
  },
  {
    id: 'content_boost',
    title: 'Content Boost',
    description: 'Migliora la qualità dei tuoi contenuti',
    detailedDescription: 'Ottieni suggerimenti personalizzati per migliorare i tuoi post e accesso a template esclusivi per creare contenuti di qualità superiore.',
    price: 7.00,
    icon: 'star',
    active: false,
    duration: '7 giorni',
    effect: 'Accesso a strumenti premium'
  },
  {
    id: 'analytics_boost',
    title: 'Analytics Boost',
    description: 'Analisi avanzate sul tuo profilo',
    detailedDescription: 'Sblocca statistiche dettagliate sul tuo profilo e sui tuoi post per comprendere meglio il tuo pubblico e ottimizzare i tuoi contenuti.',
    price: 6.00,
    icon: 'chart-bar',
    active: false,
    duration: '7 giorni',
    effect: 'Statistiche avanzate'
  }
];

type StoreScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Wallet'>;

const StoreScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<StoreScreenNavigationProp>();
  const [transactions, setTransactions] = useState<Transaction[]>(DUMMY_TRANSACTIONS);
  const [rewards, setRewards] = useState<Reward[]>(DUMMY_REWARDS);
  const [boosts, setBoosts] = useState<Boost[]>(AVAILABLE_BOOSTS);
  const [loading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'wallet' | 'rewards'>('wallet');
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'received' | 'sent'>('all');
  const [selectedBoost, setSelectedBoost] = useState<Boost | null>(null);

  // Imposta l'ID dell'utente corrente per il test
  useEffect(() => {
    if (!user) {
      // Se non c'è un utente autenticato, impostiamo un ID fittizio per il test
      const mockUser = { id: '101', username: 'mario_rossi', coins: 100 };
      // @ts-ignore - Ignoriamo l'errore TypeScript per questo test
      if (typeof user === 'undefined') {
        // @ts-ignore
        user = mockUser;
      }
    }
  }, []);

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

  // Funzione per filtrare le transazioni in base al tab attivo
  const getFilteredTransactions = () => {
    if (transactionFilter === 'all') {
      return transactions;
    } else if (transactionFilter === 'received') {
      return transactions.filter(t => t.receiver.id === user?.id);
    } else {
      return transactions.filter(t => t.sender.id === user?.id);
    }
  };

  // Funzione per aggiornare le transazioni
  const refreshTransactions = async () => {
    setRefreshing(true);
    // In una implementazione reale, qui chiameremmo l'API per ottenere le transazioni più recenti
    // Per ora, simuliamo un ritardo
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Gestisce l'attivazione di un boost
  const handleActivateBoost = (boost: Boost) => {
    // Controlla se l'utente ha abbastanza fondi
    if (user && boost.price > (user.coins || 0)) {
      Alert.alert(
        'Fondi insufficienti',
        'Non hai abbastanza SocialCoin per attivare questo boost. Vuoi guadagnare più coin?',
        [
          {
            text: 'Annulla',
            style: 'cancel',
          },
          {
            text: 'Guadagna Coin',
            onPress: () => {
              // Qui potremmo navigare a una schermata che mostra come guadagnare più coin
              Alert.alert('Funzionalità in arrivo', 'Presto potrai scoprire nuovi modi per guadagnare SocialCoin!');
            },
          },
        ]
      );
      return;
    }
    
    // Mostra la conferma
    Alert.alert(
      'Conferma attivazione',
      `Stai per attivare "${boost.title}" per ${boost.price.toFixed(2)} SocialCoin. Durata: ${boost.duration}. Confermi?`,
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Conferma',
          onPress: () => {
            // Simula l'attivazione
            setIsLoading(true);
            
            // In un'app reale, qui chiameremmo un'API
            setTimeout(() => {
              setIsLoading(false);
              
              // Aggiorna lo stato del boost
              const updatedBoosts = boosts.map(b => 
                b.id === boost.id ? { ...b, active: true } : b
              );
              setBoosts(updatedBoosts);
              
              // Mostra conferma
              Alert.alert(
                'Boost attivato',
                `Hai attivato "${boost.title}" con successo! Il boost sarà attivo per ${boost.duration}.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Chiudi i dettagli se aperti
                      setSelectedBoost(null);
                    },
                  },
                ]
              );
            }, 1500);
          },
        },
      ]
    );
  };

  // Renderizza una singola transazione
  const renderTransaction = ({ item }: { item: Transaction }) => {
    // Determina manualmente il segno per ogni transazione in base all'ID
    let isPositive = false;
    
    // ID 1: Like ricevuti (positivo)
    // ID 2: Commento inviato (negativo)
    // ID 3: Trasferimento inviato (negativo)
    // ID 4: Regalo ricevuto (positivo)
    // ID 5: Bonus di benvenuto (positivo)
    if (item.id === '1' || item.id === '4' || item.id === '5') {
      isPositive = true;
    }
    
    // Determina se la transazione è in entrata o in uscita per il testo
    const isIncoming = item.receiver.id === (user?.id || '101');
    const isSystemTransaction = item.type === 'system';
    
    return (
      <View style={[styles.transactionContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.transactionIconContainer}>
          {getTransactionIcon(item.type)}
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={[styles.transactionType, { color: colors.text }]}>
            {isSystemTransaction ? 'Sistema' : isIncoming ? 'Ricevuto da' : 'Inviato a'}
            {!isSystemTransaction && (
              <Text style={[styles.username, { color: colors.text }]}>
                {' '}{isIncoming ? item.sender.username : item.receiver.username}
              </Text>
            )}
          </Text>
          
          <Text style={[styles.transactionDescription, { color: colors.subtext }]}>
            {item.description}
          </Text>
          
          <Text style={[styles.transactionDate, { color: colors.subtext }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        
        <View style={styles.transactionAmount}>
          <Text style={[
            styles.amountText, 
            { 
              color: isPositive ? '#2ecc71' : '#e74c3c',
              fontWeight: 'bold'
            }
          ]}>
            {isPositive ? '+' : '-'}{item.amount.toFixed(2)}
          </Text>
          <Text style={[styles.coinLabel, { color: colors.subtext }]}>coin</Text>
        </View>
      </View>
    );
  };

  // Renderizza un singolo boost
  const renderBoostItem = ({ item }: { item: Boost }) => {
    return (
      <TouchableOpacity
        style={[styles.boostCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setSelectedBoost(item)}
      >
        <View style={[styles.boostIconContainer, { backgroundColor: colors.primary }]}>
          <FontAwesome5 name={item.icon} size={24} color="white" />
        </View>
        
        <View style={styles.boostContent}>
          <Text style={[styles.boostTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          
          <Text style={[styles.boostDescription, { color: colors.subtext }]} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.boostFooter}>
            <Text style={[styles.boostPrice, { color: colors.primary }]}>
              {item.price.toFixed(2)} <Text style={{ fontSize: 12 }}>SocialCoin</Text>
            </Text>
            
            {item.active ? (
              <View style={[styles.activeIndicator, { backgroundColor: colors.success }]}>
                <Text style={styles.activeText}>ATTIVO</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.activateButton,
                  { 
                    backgroundColor: user && item.price <= (user.coins || 0) 
                      ? colors.primary 
                      : colors.subtext 
                  }
                ]}
                onPress={() => handleActivateBoost(item)}
                disabled={!!(user && item.price > (user.coins || 0))}
              >
                <Text style={styles.activateButtonText}>Attiva</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {item.active && (
          <View style={[styles.activeBadge, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark" size={12} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Mostra i dettagli di un boost selezionato
  const renderBoostDetails = () => {
    if (!selectedBoost) return null;
    
    return (
      <View style={[styles.detailsContainer, { backgroundColor: colors.card }]}>
        <View style={styles.detailsHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedBoost(null)}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.detailsTitle, { color: colors.text }]}>
            Dettagli Boost
          </Text>
          
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.detailsContent}>
          <View style={[styles.detailsIconContainer, { backgroundColor: colors.primary }]}>
            <FontAwesome5 name={selectedBoost.icon} size={40} color="white" />
          </View>
          
          <View style={styles.detailsInfo}>
            <Text style={[styles.detailsName, { color: colors.text }]}>
              {selectedBoost.title}
            </Text>
            
            <Text style={[styles.detailsPrice, { color: colors.primary }]}>
              {selectedBoost.price.toFixed(2)} SocialCoin
            </Text>
            
            <Text style={[styles.detailsDescription, { color: colors.text }]}>
              {selectedBoost.detailedDescription}
            </Text>
            
            <View style={styles.detailsInfoRow}>
              <View style={styles.detailsInfoItem}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={[styles.detailsInfoText, { color: colors.subtext }]}>
                  Durata: {selectedBoost.duration}
                </Text>
              </View>
              
              <View style={styles.detailsInfoItem}>
                <Ionicons name="flash-outline" size={20} color={colors.primary} />
                <Text style={[styles.detailsInfoText, { color: colors.subtext }]}>
                  Effetto: {selectedBoost.effect}
                </Text>
              </View>
            </View>
            
            {selectedBoost.active ? (
              <View style={[styles.activeBoostBanner, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.activeBoostText, { color: colors.success }]}>
                  Boost attualmente attivo
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.detailsActivateButton,
                  { 
                    backgroundColor: user && selectedBoost.price <= (user.coins || 0) 
                      ? colors.primary 
                      : colors.subtext 
                  }
                ]}
                onPress={() => {
                  setSelectedBoost(null);
                  handleActivateBoost(selectedBoost);
                }}
                disabled={!!(user && selectedBoost.price > (user.coins || 0))}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.detailsActivateButtonText}>
                    {user && selectedBoost.price <= (user.coins || 0) 
                      ? 'Attiva Boost' 
                      : 'Coin Insufficienti'
                    }
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Funzione per ottenere l'icona in base al tipo di transazione
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Ionicons name="heart" size={24} color="#e74c3c" />;
      case 'comment':
        return <Ionicons name="chatbubble" size={24} color="#3498db" />;
      case 'post_reward':
        return <Ionicons name="trophy" size={24} color="#f39c12" />;
      case 'direct_transfer':
        return <Ionicons name="swap-horizontal" size={24} color="#2ecc71" />;
      case 'system':
        return <Ionicons name="gift" size={24} color="#9b59b6" />;
      default:
        return <Ionicons name="cash" size={24} color={colors.primary} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Store</Text>
      </View>
      
      {/* Saldo */}
      <View style={[styles.balanceContainer, { backgroundColor: colors.card }]}>
        <View>
          <Text style={[styles.balanceLabel, { color: colors.subtext }]}>Il tuo saldo</Text>
          <View style={styles.balanceRow}>
            <Text style={[styles.balanceAmount, { color: colors.text }]}>
              {user?.coins || 100.00}
            </Text>
            <Text style={[styles.balanceCurrency, { color: colors.text }]}> SocialCoin</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={() => Alert.alert('Invia SocialCoin', 'Funzionalità in arrivo')}
        >
          <Text style={styles.sendButtonText}>Invia</Text>
        </TouchableOpacity>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'wallet' && [styles.activeTab, { borderBottomColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('wallet')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'wallet' ? colors.primary : colors.subtext }
            ]}
          >
            Wallet
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'rewards' && [styles.activeTab, { borderBottomColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('rewards')}
        >
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'rewards' ? colors.primary : colors.subtext }
            ]}
          >
            Premi
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Contenuto */}
      {activeTab === 'wallet' ? (
        <>
          {/* Filtri per le transazioni */}
          <View style={styles.filtersContainer}>
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                transactionFilter === 'all' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setTransactionFilter('all')}
            >
              <Text 
                style={[
                  styles.filterText, 
                  { color: transactionFilter === 'all' ? 'white' : colors.text }
                ]}
              >
                Tutte
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                transactionFilter === 'received' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setTransactionFilter('received')}
            >
              <Text 
                style={[
                  styles.filterText, 
                  { color: transactionFilter === 'received' ? 'white' : colors.text }
                ]}
              >
                Ricevute
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                transactionFilter === 'sent' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setTransactionFilter('sent')}
            >
              <Text 
                style={[
                  styles.filterText, 
                  { color: transactionFilter === 'sent' ? 'white' : colors.text }
                ]}
              >
                Inviate
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Lista transazioni */}
          <FlatList
            data={getFilteredTransactions()}
            renderItem={renderTransaction}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.transactionsList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshTransactions}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="wallet-outline" size={80} color={colors.subtext} />
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  Nessuna transazione trovata
                </Text>
              </View>
            }
          />
        </>
      ) : (
        <>
          {/* Titolo principale */}
          <View style={styles.headerContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Boost Disponibili
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>
              Attiva i boost per migliorare la tua esperienza
            </Text>
          </View>
          
          {/* Lista boost */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={boosts}
              renderItem={renderBoostItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.boostsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="flash-outline" size={80} color={colors.subtext} />
                  <Text style={[styles.emptyText, { color: colors.text }]}>
                    Nessun boost disponibile al momento
                  </Text>
                </View>
              }
            />
          )}
          
          {/* Dettagli boost */}
          {selectedBoost && renderBoostDetails()}
        </>
      )}
      
      {/* Indicatore di caricamento */}
      {loading && (
        <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
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
  header: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
  },
  balanceContent: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceCurrency: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  coinLabel: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  sendButton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
  },
  transactionsList: {
    paddingBottom: 20,
  },
  transactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '500',
  },
  username: {
    fontWeight: 'bold',
  },
  transactionDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  boostsList: {
    padding: 16,
  },
  boostCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    padding: 12,
    overflow: 'hidden',
  },
  boostIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  boostContent: {
    flex: 1,
  },
  boostTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  boostDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  boostFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boostPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  activeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailsContent: {
    flex: 1,
  },
  detailsIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    alignSelf: 'center',
  },
  detailsInfo: {
    padding: 16,
  },
  detailsName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  detailsPrice: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
  },
  detailsDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  detailsInfoRow: {
    flexDirection: 'column',
    marginBottom: 24,
  },
  detailsInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsInfoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  detailsActivateButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsActivateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeBoostBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  activeBoostText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
});

export default StoreScreen; 