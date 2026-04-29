import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import { getSupabase } from '../lib/supabase';
import { colors, spacing } from '../theme/colors';

export default function RegisterCustomerScreen() {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '', birth_date: '', address: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSignup = async () => {
    const { email, password, full_name, phone, birth_date, address } = form;
    if (!email || !password || !full_name) {
      return Alert.alert('Champs requis', 'Email, mot de passe et nom complet.');
    }
    if (password.length < 6) {
      return Alert.alert('Mot de passe trop court', 'Le mot de passe doit contenir au moins 6 caractères.');
    }
    setLoading(true);

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error('Supabase auth.signUp error:', error);
      setLoading(false);
      return Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de l\'inscription.');
    }

    const userId = data.user?.id;
    if (userId) {
      const { error: pErr } = await supabase.from('profiles').insert({
        id: userId, email, role: 'customer', phone, birth_date: birth_date || null, address,
      });
      if (pErr) {
        console.error('Supabase profiles.insert error:', pErr);
        setLoading(false);
        return Alert.alert('Profil', pErr.message);
      }

      const { error: cErr } = await supabase.from('customer_profiles').insert({
        id: userId, full_name,
      });
      if (cErr) {
        console.error('Supabase customer_profiles.insert error:', cErr);
        setLoading(false);
        return Alert.alert('Profil client', cErr.message);
      }
    }

    setLoading(false);
    Alert.alert('Compte créé', 'Vous pouvez maintenant vous connecter.');
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Inscription particulier</Text>
      <Text style={styles.subtitle}>Quelques infos et c'est parti 🐾</Text>

      <View style={{ marginTop: spacing.lg }}>
        <TextField label="Nom complet" value={form.full_name} onChangeText={set('full_name')} placeholder="Marie Dupont" error="" style={{}} />
        <TextField label="Email" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" placeholder="vous@email.com" error="" style={{}} />
        <TextField label="Téléphone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" placeholder="06 ..." error="" style={{}} />
        <TextField label="Date de naissance" value={form.birth_date} onChangeText={set('birth_date')} placeholder="YYYY-MM-DD" error="" style={{}} />
        <TextField label="Adresse" value={form.address} onChangeText={set('address')} placeholder="Votre adresse" error="" style={{}} />
        <TextField label="Mot de passe" value={form.password} onChangeText={set('password')} secureTextEntry placeholder="Min. 6 caractères" error="" style={{}} />

        <PrimaryButton title="Créer mon compte" onPress={handleSignup} loading={loading} disabled={false} style={{}} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 6 },
});
