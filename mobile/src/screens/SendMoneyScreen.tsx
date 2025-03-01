import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../navigation/types';

type SendMoneyScreenNavigationProp = NativeStackNavigationProp<any>;

const SendMoneyScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<SendMoneyScreenNavigationProp>();
  
  // Stati per i campi del form
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Stato per i suggerimenti di utenti
  const [suggestedUsers, setSuggestedUsers] = useState([
    { id: '102', username: 'matteo_bianchi', avatar: 'https://ui-avatars.com/api/?name=Matteo+Bianchi&background=random' },
    { id: '103', username: 'marco_verdi', avatar: 'https://ui-avatars.com/api/?name=Marco+Verdi&background=random' },
    { id: '104', username: 'giulia_neri', avatar: 'https://ui-avatars.com/api/?name=Giulia+Neri&background=random' },
    { id: '105', username: 'mario_rossi', avatar: 'https://ui-avatars.com/api/?name=Mario+Rossi&background=random' },
  ]);
  
  // Funzione per validare l'importo
  const validateAmount = (value: string) => {
    // Rimuovi caratteri non numerici eccetto il punto decimale
    const cleanedValue = value.replace(/[^0-9.]/g, '');
    
    // Assicurati che ci sia al massimo un punto decimale
    const parts = cleanedValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limita a due decimali
    if (parts.length === 2 && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    return cleanedValue;
  };
  
  // Gestisce il cambio dell'importo
  const handleAmountChange = (value: string) => {
    const validatedAmount = validateAmount(value);
    setAmount(validatedAmount);
  };
  
  // Funzione per inviare denaro
  const handleSendMoney = () => {
    // Validazione
    if (!recipient) {
      Alert.alert('Errore', 'Inserisci un destinatario');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Errore', 'Inserisci un importo valido');
      return;
    }
    
    const amountValue = parseFloat(amount);
    
    // Controlla se l'utente ha abbastanza fondi
    if (user && amountValue > (user.coins || 0)) {
      Alert.alert('Fondi insufficienti', 'Non hai abbastanza SocialCoin per completare questa transazione');
      return;
    }
    
    // Controlla il limite giornaliero (0.50 coin)
    if (amountValue > 0.50) {
      Alert.alert('Limite superato', 'Il limite massimo giornaliero per i trasferimenti è di 0.50 SocialCoin');
      return;
    }
    
    // Mostra la conferma
    Alert.alert(
      'Conferma trasferimento',
      `Stai per inviare ${amountValue.toFixed(2)} SocialCoin a ${recipient}${note ? ` con la nota: "${note}"` : ''}. Confermi?`,
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Conferma',
          onPress: () => {
            // Simula l'invio
            setIsLoading(true);
            
            // In un'app reale, qui chiameremmo un'API
            setTimeout(() => {
              setIsLoading(false);
              
              // Mostra conferma e torna alla schermata precedente
              Alert.alert(
                'Trasferimento completato',
                `Hai inviato ${amountValue.toFixed(2)} SocialCoin a ${recipient}`,
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            }, 1500);
          },
        },
      ]
    );
  };
  
  // Seleziona un utente suggerito
  const selectUser = (username: string) => {
    setRecipient(username);
  };
  
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Invia SocialCoin</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Trasferisci SocialCoin ad altri utenti
          </Text>
        </View>
        
        {/* Saldo disponibile */}
        <View style={[styles.balanceContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.balanceLabel, { color: colors.subtext }]}>Saldo disponibile</Text>
          <Text style={[styles.balanceAmount, { color: colors.text }]}>
            {user?.coins || 100.00} <Text style={{ color: colors.primary }}>SocialCoin</Text>
          </Text>
        </View>
        
        {/* Form di invio */}
        <View style={[styles.formContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Campo destinatario */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Destinatario</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <Ionicons name="person" size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nome utente"
                placeholderTextColor={colors.subtext}
                value={recipient}
                onChangeText={setRecipient}
                autoCapitalize="none"
              />
            </View>
          </View>
          
          {/* Utenti suggeriti */}
          <View style={styles.suggestedUsersContainer}>
            <Text style={[styles.suggestedLabel, { color: colors.subtext }]}>Suggeriti</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestedScroll}>
              {suggestedUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.suggestedUser,
                    { 
                      backgroundColor: recipient === user.username ? colors.primary + '30' : colors.card,
                      borderColor: recipient === user.username ? colors.primary : colors.border
                    }
                  ]}
                  onPress={() => selectUser(user.username)}
                >
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text 
                    style={[
                      styles.suggestedUsername, 
                      { 
                        color: recipient === user.username ? colors.primary : colors.text 
                      }
                    ]}
                    numberOfLines={1}
                  >
                    {user.username}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Campo importo */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Importo</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <Ionicons name="cash" size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="0.00"
                placeholderTextColor={colors.subtext}
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
              />
              <Text style={[styles.currencyLabel, { color: colors.primary }]}>SocialCoin</Text>
            </View>
            <Text style={[styles.limitText, { color: colors.subtext }]}>
              Limite giornaliero: 0.50 SocialCoin
            </Text>
          </View>
          
          {/* Campo nota */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Nota (opzionale)</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <Ionicons name="create" size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Aggiungi una nota"
                placeholderTextColor={colors.subtext}
                value={note}
                onChangeText={setNote}
                multiline
              />
            </View>
          </View>
        </View>
        
        {/* Pulsante di invio */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            { 
              backgroundColor: isLoading || !recipient || !amount || parseFloat(amount) <= 0
                ? colors.primary + '80'
                : colors.primary
            }
          ]}
          onPress={handleSendMoney}
          disabled={isLoading || !recipient || !amount || parseFloat(amount) <= 0}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="white" style={styles.sendIcon} />
              <Text style={styles.sendButtonText}>Invia SocialCoin</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  balanceContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  currencyLabel: {
    fontWeight: '500',
    fontSize: 14,
  },
  limitText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  suggestedUsersContainer: {
    marginBottom: 16,
  },
  suggestedLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  suggestedScroll: {
    flexDirection: 'row',
  },
  suggestedUser: {
    alignItems: 'center',
    marginRight: 12,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    width: 80,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  suggestedUsername: {
    fontSize: 12,
    textAlign: 'center',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    marginBottom: 16,
  },
  sendIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SendMoneyScreen; 