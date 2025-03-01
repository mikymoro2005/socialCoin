import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

const RewardsScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  
  // Stati
  const [boosts, setBoosts] = useState<Boost[]>(AVAILABLE_BOOSTS);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBoost, setSelectedBoost] = useState<Boost | null>(null);
  
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
                {isLoading ? (
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
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header con saldo */}
      <View style={[styles.balanceContainer, { backgroundColor: colors.card }]}>
        <View style={styles.balanceContent}>
          <Text style={[styles.balanceLabel, { color: colors.subtext }]}>I tuoi SocialCoin</Text>
          <Text style={[styles.balanceAmount, { color: colors.text }]}>
            {user?.coins || 100.00}
          </Text>
        </View>
      </View>
      
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
      <View style={styles.boostsContainer}>
        <FlatList
          data={boosts}
          renderItem={renderBoostItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.boostsList}
          showsVerticalScrollIndicator={false}
        />
      </View>
      
      {/* Dettagli boost */}
      {selectedBoost && renderBoostDetails()}
      
      {/* Indicatore di caricamento */}
      {isLoading && (
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
  balanceContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceContent: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
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
  boostsContainer: {
    flex: 1,
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
  loadingContainer: {
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

export default RewardsScreen; 