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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

const RewardsScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  
  // Stati
  const [rewards, setRewards] = useState<Reward[]>(DUMMY_REWARDS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  
  // Categorie disponibili
  const categories = [
    { id: 'all', name: 'Tutti', icon: 'grid' },
    { id: 'digital', name: 'Digitali', icon: 'cloud' },
    { id: 'physical', name: 'Fisici', icon: 'cube' },
    { id: 'donation', name: 'Donazioni', icon: 'heart' },
    { id: 'experience', name: 'Esperienze', icon: 'star' },
  ];
  
  // Filtra i premi in base alla categoria selezionata
  const getFilteredRewards = () => {
    if (selectedCategory === 'all') {
      return rewards;
    }
    return rewards.filter(reward => reward.category === selectedCategory);
  };
  
  // Ottieni i premi in evidenza
  const getFeaturedRewards = () => {
    return rewards.filter(reward => reward.featured);
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
            setIsLoading(true);
            
            // In un'app reale, qui chiameremmo un'API
            setTimeout(() => {
              setIsLoading(false);
              
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
            borderColor: isActive ? colors.primary : colors.border,
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
  
  // Mostra i dettagli di un premio selezionato
  const renderRewardDetails = () => {
    if (!selectedReward) return null;
    
    return (
      <View style={[styles.detailsContainer, { backgroundColor: colors.card }]}>
        <View style={styles.detailsHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedReward(null)}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.detailsTitle, { color: colors.text }]}>
            Dettagli Premio
          </Text>
          
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.detailsContent}>
          <Image
            source={{ uri: selectedReward.image }}
            style={styles.detailsImage}
            resizeMode="cover"
          />
          
          <View style={styles.detailsInfo}>
            <Text style={[styles.detailsName, { color: colors.text }]}>
              {selectedReward.title}
            </Text>
            
            <Text style={[styles.detailsPrice, { color: colors.primary }]}>
              {selectedReward.price.toFixed(2)} SocialCoin
            </Text>
            
            <Text style={[styles.detailsDescription, { color: colors.text }]}>
              {selectedReward.description}
            </Text>
            
            <View style={styles.detailsCategory}>
              <Ionicons 
                name={
                  selectedReward.category === 'digital' ? 'cloud' :
                  selectedReward.category === 'physical' ? 'cube' :
                  selectedReward.category === 'donation' ? 'heart' : 'star'
                } 
                size={16} 
                color={colors.primary} 
              />
              <Text style={[styles.detailsCategoryText, { color: colors.subtext }]}>
                {
                  selectedReward.category === 'digital' ? 'Premio Digitale' :
                  selectedReward.category === 'physical' ? 'Premio Fisico' :
                  selectedReward.category === 'donation' ? 'Donazione' : 'Esperienza'
                }
              </Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.detailsBuyButton,
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
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.detailsBuyButtonText}>
                  {user && selectedReward.price <= (user.coins || 0) 
                    ? 'Acquista Premio' 
                    : 'Coin Insufficienti'
                  }
                </Text>
              )}
            </TouchableOpacity>
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
      
      {/* Categorie */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
      
      {/* Premi in evidenza */}
      {selectedCategory === 'all' && getFeaturedRewards().length > 0 && (
        <View style={styles.featuredContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              In Evidenza
            </Text>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          >
            {getFeaturedRewards().map(reward => (
              <TouchableOpacity
                key={reward.id}
                style={[styles.featuredCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setSelectedReward(reward)}
              >
                <Image
                  source={{ uri: reward.image }}
                  style={styles.featuredImage}
                  resizeMode="cover"
                />
                
                <View style={styles.featuredContent}>
                  <Text style={[styles.featuredTitle, { color: colors.text }]} numberOfLines={1}>
                    {reward.title}
                  </Text>
                  
                  <Text style={[styles.featuredPrice, { color: colors.primary }]}>
                    {reward.price.toFixed(2)} SocialCoin
                  </Text>
                </View>
                
                <View style={[styles.featuredBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="star" size={12} color="white" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Lista premi */}
      <View style={styles.rewardsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedCategory === 'all' 
              ? 'Tutti i Premi' 
              : categories.find(c => c.id === selectedCategory)?.name || 'Premi'
            }
          </Text>
        </View>
        
        <FlatList
          data={getFilteredRewards()}
          renderItem={renderRewardItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.rewardsList}
          columnWrapperStyle={styles.rewardsRow}
          showsVerticalScrollIndicator={false}
        />
      </View>
      
      {/* Dettagli premio */}
      {selectedReward && renderRewardDetails()}
      
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
  categoriesContainer: {
    marginVertical: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
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
  featuredContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuredList: {
    paddingHorizontal: 16,
  },
  featuredCard: {
    width: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
  },
  featuredImage: {
    width: '100%',
    height: 120,
  },
  featuredContent: {
    padding: 12,
  },
  featuredTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  featuredPrice: {
    fontSize: 14,
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
  rewardsContainer: {
    flex: 1,
  },
  rewardsList: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  rewardsRow: {
    justifyContent: 'space-between',
  },
  rewardCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
  },
  rewardImage: {
    width: '100%',
    height: 100,
  },
  rewardContent: {
    padding: 12,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: '500',
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
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
  detailsImage: {
    width: '100%',
    height: 200,
  },
  detailsInfo: {
    padding: 16,
  },
  detailsName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailsPrice: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
  },
  detailsDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  detailsCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  detailsCategoryText: {
    marginLeft: 8,
    fontSize: 14,
  },
  detailsBuyButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsBuyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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