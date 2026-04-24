import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { colors, radius, spacing } from '../theme/colors';

const services = [
  { emoji: '🐶', title: 'Garde à domicile', desc: 'Votre animal reste dans son environnement.' },
  { emoji: '🚶', title: 'Promenades', desc: 'Des balades adaptées à son énergie.' },
  { emoji: '🏠', title: 'Pension familiale', desc: 'Accueilli comme à la maison.' },
  { emoji: '🐾', title: 'Visites & soins', desc: 'Repas, câlins et nettoyage.' },
];

export default function HomeScreen({ navigation }) {
  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Galipet</Text>
        <Text style={styles.title}>La garde d'animaux,{"\n"}simple et bienveillante.</Text>
        <Text style={styles.subtitle}>
          Trouvez un pet-sitter de confiance près de chez vous, ou proposez vos services en tant que professionnel.
        </Text>

        <View style={{ gap: 12, marginTop: spacing.lg }}>
          <PrimaryButton title="Créer un compte" onPress={() => navigation.navigate('RegisterChoice')} />
          <SecondaryButton title="J'ai déjà un compte" onPress={() => navigation.navigate('Login')} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Nos services</Text>
      <View style={styles.grid}>
        {services.map((s) => (
          <View key={s.title} style={styles.card}>
            <Text style={styles.emoji}>{s.emoji}</Text>
            <Text style={styles.cardTitle}>{s.title}</Text>
            <Text style={styles.cardDesc}>{s.desc}</Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.accent + '55',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  kicker: { color: colors.primary, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, lineHeight: 34 },
  subtitle: { marginTop: 12, color: colors.textMuted, fontSize: 15, lineHeight: 22 },

  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    flexBasis: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: { fontSize: 28, marginBottom: 6 },
  cardTitle: { fontWeight: '700', color: colors.text, marginBottom: 4 },
  cardDesc: { color: colors.textMuted, fontSize: 13 },
});
