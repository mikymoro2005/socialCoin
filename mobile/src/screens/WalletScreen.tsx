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
  {
    id: '1',
    title: 'Abbonamento Premium',
    description: 'Un mese di accesso a tutte le funzionalità premium dell\'app',
    price: 10.00,
    image: 'https://ui-avatars.com/api/?name=Premium&background=random&color=fff&size=200',
    category: 'digital',
    featured: true,
    available: true,
  },
  {
    id: '2',
    title: 'Post in Evidenza',
    description: 'Il tuo post sarà in evidenza nella home per 24 ore',
    price: 5.00,
    image: 'https://ui-avatars.com/api/?name=Post&background=random&color=fff&size=200',
    category: 'digital',
    available: true,
  },
  {
    id: '3',
    title: 'T-Shirt SocialCoin',
    description: 'T-shirt esclusiva con il logo SocialCoin',
    price: 25.00,
    image: 'https://ui-avatars.com/api/?name=Tshirt&background=random&color=fff&size=200',
    category: 'physical',
    available: true,
  },
  {
    id: '4',
    title: 'Donazione Ambientale',
    description: 'Dona a un\'organizzazione per la protezione dell\'ambiente',
    price: 2.00,
    image: 'https://ui-avatars.com/api/?name=Earth&background=random&color=fff&size=200',
    category: 'donation',
    available: true,
  },
  {
    id: '5',
    title: 'Videocall con Creator',
    description: 'Una videocall di 15 minuti con un creator a tua scelta',
    price: 50.00,
    image: 'https://ui-avatars.com/api/?name=Call&background=random&color=fff&size=200',
    category: 'experience',
    available: true,
  },
  {
    id: '6',
    title: 'Badge Verificato',
    description: 'Ottieni un badge verificato sul tuo profilo',
    price: 15.00,
    image: 'https://ui-avatars.com/api/?name=Badge&background=random&color=fff&size=200',
    category: 'digital',
    available: true,
  },
];

type StoreScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Wallet'>;

const StoreScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<StoreScreenNavigationProp>();
  const [transactions, setTransactions] = useState<Transaction[]>(DUMMY_TRANSACTIONS);
  const [rewards, setRewards] = useState<Reward[]>(DUMMY_REWARDS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'wallet' | 'rewards'>('wallet');
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'received' | 'sent'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  // Categorie disponibili per i premi
  const categories = [
    { id: 'all', name: 'Tutti', icon: 'grid' },
    { id: 'digital', name: 'Digitali', icon: 'cloud' },
    { id: 'physical', name: 'Fisici', icon: 'cube' },
    { id: 'donation', name: 'Donazioni', icon: 'heart' },
    { id: 'experience', name: 'Esperienze', icon: 'star' },
  ];

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

  // Funzione per filtrare i premi in base alla categoria selezionata
  const getFilteredRewards = () => {
    if (selectedCategory === 'all') {
      return rewards;
    }
    return rewards.filter(reward => reward.category === selectedCategory);
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

  // Funzione per aggiornare le transazioni
  const refreshTransactions = async () => {
    setRefreshing(true);
    // In una implementazione reale, qui chiameremmo l'API per ottenere le transazioni più recenti
    // Per ora, simuliamo un ritardo
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Gestisce l'acquisto di un premio
  const handlePurchaseReward = (reward: Reward) => {
    // Controlla se l'utente ha abbastanza fondi
    if (user && reward.price > (user.coins || 0)) {
      Alert.alert(
        'Fondi insufficienti',
        'Non hai abbastanza SocialCoin per acquistare questo premio. Vuoi guadagnare più coin?',
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
      'Conferma acquisto',
      `Stai per acquistare "${reward.title}" per ${reward.price.toFixed(2)} SocialCoin. Confermi?`,
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Conferma',
          onPress: () => {
            // Simula l'acquisto
            setLoading(true);
            
            // In un'app reale, qui chiameremmo un'API
            setTimeout(() => {
              setLoading(false);
              
              // Mostra conferma
              Alert.alert(
                'Acquisto completato',
                `Hai acquistato "${reward.title}" con successo!`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Qui potremmo aggiornare il saldo dell'utente
                      // e mostrare dettagli sul premio acquistato
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

  // Renderizza un singolo premio
  const renderRewardItem = ({ item }: { item: Reward }) => {
    return (
      <TouchableOpacity
        style={[styles.rewardCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setSelectedReward(item)}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.rewardImage}
          resizeMode="cover"
        />
        
        <View style={styles.rewardContent}>
          <Text style={[styles.rewardTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          
          <Text style={[styles.rewardDescription, { color: colors.subtext }]} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.rewardFooter}>
            <Text style={[styles.rewardPrice, { color: colors.primary }]}>
              {item.price.toFixed(2)} <Text style={{ fontSize: 12 }}>SocialCoin</Text>
            </Text>
            
            <TouchableOpacity
              style={[
                styles.buyButton,
                { 
                  backgroundColor: user && item.price <= (user.coins || 0) 
                    ? colors.primary 
                    : colors.subtext 
                }
              ]}
              onPress={() => handlePurchaseReward(item)}
              disabled={!!(user && item.price > (user.coins || 0))}
            >
              <Text style={styles.buyButtonText}>Acquista</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {item.featured && (
          <View style={[styles.featuredBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="star" size={12} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Renderizza una categoria
  const renderCategoryItem = ({ item }: { item: typeof categories[0] }) => {
    const isActive = selectedCategory === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryButton,
          { 
            backgroundColor: isActive ? colors.primary : colors.card,
            borderColor: isActive ? colors.primary : colors.border
          }
        ]}
        onPress={() => setSelectedCategory(item.id)}
      >
        <Ionicons 
          name={item.icon as any} 
          size={16} 
          color={isActive ? 'white' : colors.text} 
          style={styles.categoryIcon}
        />
        <Text 
          style={[
            styles.categoryText, 
            { color: isActive ? 'white' : colors.text }
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header con saldo */}
      <View style={[styles.balanceContainer, { backgroundColor: colors.card }]}>
        <View style={styles.balanceContent}>
          <Text style={[styles.balanceLabel, { color: colors.subtext }]}>
            Il tuo saldo
          </Text>
          <Text style={[styles.balanceAmount, { color: colors.text }]}>
            {user?.coins?.toFixed(2) || '0.00'} <Text style={styles.coinLabel}>SocialCoin</Text>
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('SendMoney')}
        >
          <Ionicons name="send" size={18} color="white" />
          <Text style={styles.sendButtonText}>Invia</Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab switcher */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'wallet' && [styles.activeTab, { borderColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('wallet')}
        >
          <Ionicons 
            name="wallet-outline" 
            size={20} 
            color={activeTab === 'wallet' ? colors.primary : colors.text} 
          />
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'wallet' ? colors.primary : colors.text }
            ]}
          >
            Wallet
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'rewards' && [styles.activeTab, { borderColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('rewards')}
        >
          <Ionicons 
            name="gift-outline" 
            size={20} 
            color={activeTab === 'rewards' ? colors.primary : colors.text} 
          />
          <Text 
            style={[
              styles.tabText, 
              { color: activeTab === 'rewards' ? colors.primary : colors.text }
            ]}
          >
            Premi
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Contenuto del tab attivo */}
      {activeTab === 'wallet' ? (
        <>
          {/* Filtri per le transazioni */}
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                transactionFilter === 'all' && [styles.activeFilter, { backgroundColor: colors.primary }]
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
                transactionFilter === 'received' && [styles.activeFilter, { backgroundColor: colors.primary }]
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
                transactionFilter === 'sent' && [styles.activeFilter, { backgroundColor: colors.primary }]
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
          
          {/* Lista delle transazioni */}
          <FlatList
            key="transactions-list"
            data={getFilteredTransactions()}
            renderItem={renderTransaction}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.transactionsList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshTransactions}
                colors={[colors.primary]}
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
          {/* Categorie per i premi */}
          <FlatList
            horizontal
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
          
          {/* Lista dei premi */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              key="rewards-list"
              data={getFilteredRewards()}
              renderItem={renderRewardItem}
              keyExtractor={item => item.id}
              numColumns={2}
              contentContainerStyle={styles.rewardsList}
              columnWrapperStyle={styles.rewardsRow}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="gift-outline" size={80} color={colors.subtext} />
                  <Text style={[styles.emptyText, { color: colors.text }]}>
                    Nessun premio disponibile in questa categoria
                  </Text>
                </View>
              }
            />
          )}
        </>
      )}
      
      {/* Modal per i dettagli del premio */}
      {selectedReward && (
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedReward(null)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <Image
              source={{ uri: selectedReward.image }}
              style={styles.modalImage}
              resizeMode="cover"
            />
            
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedReward.title}
              </Text>
              
              <Text style={[styles.modalDescription, { color: colors.subtext }]}>
                {selectedReward.description}
              </Text>
              
              <View style={styles.modalPriceContainer}>
                <Text style={[styles.modalPriceLabel, { color: colors.subtext }]}>
                  Prezzo:
                </Text>
                <Text style={[styles.modalPrice, { color: colors.primary }]}>
                  {selectedReward.price.toFixed(2)} SocialCoin
                </Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.modalBuyButton,
                  { 
                    backgroundColor: user && selectedReward.price <= (user.coins || 0) 
                      ? colors.primary 
                      : colors.subtext 
                  }
                ]}
                onPress={() => {
                  setSelectedReward(null);
                  handlePurchaseReward(selectedReward);
                }}
                disabled={!!(user && selectedReward.price > (user.coins || 0))}
              >
                <Text style={styles.modalBuyButtonText}>
                  {user && selectedReward.price <= (user.coins || 0) 
                    ? 'Acquista ora' 
                    : 'Fondi insufficienti'
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 60, // Padding aggiuntivo per evitare la Dynamic Island
  },
  balanceContent: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  coinLabel: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
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
  filterContainer: {
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
  activeFilter: {
    borderRadius: 20,
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
  // Stili per i premi
  categoriesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rewardsList: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  rewardsRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  rewardCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 16,
  },
  rewardImage: {
    width: '100%',
    height: 120,
  },
  rewardContent: {
    padding: 12,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 12,
    marginBottom: 8,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buyButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Stili per il modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 180,
  },
  modalContent: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  modalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalPriceLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBuyButton: {
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  modalBuyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StoreScreen; 