import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importa le schermate
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import WalletScreen from '../screens/WalletScreen';
import SendMoneyScreen from '../screens/SendMoneyScreen';
import RewardsScreen from '../screens/RewardsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SearchScreen from '../screens/SearchScreen';

// Importa i tipi
import { AuthStackParamList, MainTabParamList } from './types';

// Per ora, creiamo un componente placeholder per la schermata di creazione post
const CreatePostScreen = () => {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <Ionicons name="add-circle" size={100} color={colors.primary} />
    </View>
  );
};

// Creazione degli stack di navigazione
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const MainStack = createNativeStackNavigator();

// Stack di navigazione per l'autenticazione
const AuthNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Accedi' }} />
      <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registrati' }} />
    </AuthStack.Navigator>
  );
};

// Tab di navigazione principale
const MainNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'CreatePost') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Wallet') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <MainTab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Home',
          headerShown: false 
        }} 
      />
      <MainTab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ 
          title: 'Cerca',
          headerShown: false 
        }} 
      />
      <MainTab.Screen name="CreatePost" component={CreatePostScreen} options={{ title: 'Nuovo Post' }} />
      <MainTab.Screen name="Wallet" component={WalletScreen} options={{ title: 'Store' }} />
      <MainTab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profilo' }} />
    </MainTab.Navigator>
  );
};

// Navigatore principale dell'app
export const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();
  
  if (isLoading) {
    // Mostra un indicatore di caricamento mentre verifichiamo lo stato di autenticazione
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <NavigationContainer>
      {user ? (
        <MainStack.Navigator screenOptions={{ headerShown: false }}>
          <MainStack.Screen name="MainTabs" component={MainNavigator} />
          <MainStack.Screen 
            name="SendMoney" 
            component={SendMoneyScreen} 
            options={{
              headerShown: true,
              presentation: 'modal',
              headerTitle: 'Invia SocialCoin',
              headerTintColor: colors.text,
              headerStyle: {
                backgroundColor: colors.card,
              },
            }}
          />
          <MainStack.Screen 
            name="Notifications" 
            component={NotificationsScreen} 
            options={{
              headerShown: true,
              presentation: 'modal',
              headerTitle: 'Notifiche',
              headerTintColor: colors.text,
              headerStyle: {
                backgroundColor: colors.card,
              },
            }}
          />
        </MainStack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}; 