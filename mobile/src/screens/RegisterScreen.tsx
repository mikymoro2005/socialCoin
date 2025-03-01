import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme, HelperText } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { signUp } = useAuth();
  const theme = useTheme();

  // Validazione password
  const isPasswordValid = () => {
    const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    return passwordRegex.test(password);
  };

  const handleRegister = async () => {
    // Validazione
    if (!username || !email || !password || !confirmPassword) {
      setError('Tutti i campi sono obbligatori');
      return;
    }

    if (username.length < 3) {
      setError('Il nome utente deve contenere almeno 3 caratteri');
      return;
    }

    if (password !== confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    if (password.length < 8) {
      setError('La password deve contenere almeno 8 caratteri');
      return;
    }

    if (!isPasswordValid()) {
      setError('La password deve contenere almeno una lettera maiuscola, una minuscola e un numero o carattere speciale');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signUp(username, email, password);
      Alert.alert(
        "Registrazione completata",
        "Il tuo account è stato creato con successo!",
        [{ text: "OK", onPress: () => navigation.navigate('Login') }]
      );
    } catch (err: any) {
      console.log('Errore completo:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(Array.isArray(err.response.data.message) 
          ? err.response.data.message[0] 
          : err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Errore durante la registrazione. Riprova più tardi.');
      }
      console.error('Errore di registrazione:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/logo-placeholder.png')} 
            style={styles.logo}
            resizeMode="contain"
            onError={(e) => console.log('Error loading image:', e.nativeEvent.error)}
          />
          <Text style={styles.title}>Social App</Text>
          <Text style={styles.subtitle}>Crea il tuo account</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          label="Nome utente"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          autoCapitalize="none"
          left={<TextInput.Icon icon="account" />}
        />
        <HelperText type="info" visible={true}>
          Minimo 3 caratteri
        </HelperText>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          left={<TextInput.Icon icon="email" />}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secureTextEntry}
          style={styles.input}
          right={
            <TextInput.Icon
              icon={secureTextEntry ? 'eye' : 'eye-off'}
              onPress={() => setSecureTextEntry(!secureTextEntry)}
            />
          }
          left={<TextInput.Icon icon="lock" />}
        />
        <HelperText type="info" visible={true}>
          Minimo 8 caratteri, una maiuscola, una minuscola e un numero o carattere speciale
        </HelperText>

        <TextInput
          label="Conferma password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={secureTextEntry}
          style={styles.input}
          left={<TextInput.Icon icon="lock-check" />}
        />

        <Button
          mode="contained"
          onPress={handleRegister}
          style={styles.button}
          loading={loading}
          disabled={loading}
        >
          Registrati
        </Button>

        <View style={styles.loginContainer}>
          <Text>Hai già un account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: theme.colors.primary }}>Accedi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 5,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default RegisterScreen; 