import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import { getSupabase } from '../lib/supabase';
import { colors, spacing } from '../theme/colors';

export default function RegisterCompanyScreen() {
  const [form, setForm] = useState({
    email: '', password: '', company_name: '', contact_name: '', siret_or_id: '', phone: '',
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSignup = async () => {
    const { email, password, company_name, contact_name, siret_or_id, phone } = form;
    if (!email || !password || !company_name || !contact_name || !siret_or_id) {
      return Alert.alert('Champs requis', 'Tous les champs entreprise sont obligatoires.');
    }
    setLoading(true);

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setLoading(false); return Alert.alert('Erreur', error.message); }

    const userId = data.user?.id;
    if (userId) {
      const { error: pErr } = await supabase.from('profiles').insert({
        id: userId, email, role: 'professional', phone,
      });
      if (pErr) { setLoading(false); return Alert.alert('Profil', pErr.message); }

      const { error: cErr } = await supabase.from('company_profiles').insert({
        user_id: userId, company_name, contact_name, siret_or_id,
      });
      if (cErr) { setLoading(false); return Alert.alert('Profil entreprise', cErr.message); }
    }

    setLoading(false);
    Alert.alert('Compte créé', 'Vous pouvez maintenant vous connecter.');
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Inscription professionnel</Text>
      <Text style={styles.subtitle}>Présentez votre activité.</Text>

      <View style={{ marginTop: spacing.lg }}>
        <TextField label="Nom de l'entreprise" value={form.company_name} onChangeText={set('company_name')} placeholder="Galipet Pro SARL" />
        <TextField label="Nom du contact" value={form.contact_name} onChangeText={set('contact_name')} placeholder="Jean Martin" />
        <TextField label="SIRET / Identifiant" value={form.siret_or_id} onChangeText={set('siret_or_id')} placeholder="123 456 789 00012" />
        <TextField label="Email pro" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" placeholder="contact@entreprise.com" />
        <TextField label="Téléphone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" placeholder="01 ..." />
        <TextField label="Mot de passe" value={form.password} onChangeText={set('password')} secureTextEntry placeholder="Min. 6 caractères" />

        <PrimaryButton title="Créer mon compte pro" onPress={handleSignup} loading={loading} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 6 },
});
