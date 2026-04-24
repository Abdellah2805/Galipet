import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import { getSupabase } from '../lib/supabase';
import { colors, spacing } from '../theme/colors';

export default function RegisterCustomerScreen() {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSignup = async () => {
    const { email, password, full_name, phone } = form;
    if (!email || !password || !full_name) {
      return Alert.alert('Champs requis', 'Email, mot de passe et nom complet.');
    }
    setLoading(true);

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setLoading(false); return Alert.alert('Erreur', error.message); }

    const userId = data.user?.id;
    if (userId) {
      const { error: pErr } = await supabase.from('profiles').insert({
        id: userId, email, role: 'customer', phone,
      });
      if (pErr) { setLoading(false); return Alert.alert('Profil', pErr.message); }

      const { error: cErr } = await supabase.from('customer_profiles').insert({
        id: userId, full_name,
      });
      if (cErr) { setLoading(false); return Alert.alert('Profil client', cErr.message); }
    }

    setLoading(false);
    Alert.alert('Compte créé', 'Vous pouvez maintenant vous connecter.');
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Inscription particulier</Text>
      <Text style={styles.subtitle}>Quelques infos et c'est parti 🐾</Text>

      <View style={{ marginTop: spacing.lg }}>
        <TextField label="Nom complet" value={form.full_name} onChangeText={set('full_name')} placeholder="Marie Dupont" />
        <TextField label="Email" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" placeholder="vous@email.com" />
        <TextField label="Téléphone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" placeholder="06 ..." />
        <TextField label="Mot de passe" value={form.password} onChangeText={set('password')} secureTextEntry placeholder="Min. 6 caractères" />

        <PrimaryButton title="Créer mon compte" onPress={handleSignup} loading={loading} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 6 },
});
