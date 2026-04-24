import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { getSupabase } from '../lib/supabase';
import { colors, spacing } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Champs requis', 'Email et mot de passe.');
    setLoading(true);
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Connexion impossible', error.message);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Bon retour 👋</Text>
      <Text style={styles.subtitle}>Connectez-vous à votre compte Galipet.</Text>

      <View style={{ marginTop: spacing.lg }}>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="vous@email.com"
        />
        <TextField
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        <PrimaryButton title="Se connecter" onPress={handleLogin} loading={loading} />
        <View style={{ height: 12 }} />
        <SecondaryButton title="Créer un compte" onPress={() => navigation.navigate('RegisterChoice')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 6 },
});
