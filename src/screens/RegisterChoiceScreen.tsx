import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { colors, radius, spacing } from '../theme/colors';

function ChoiceCard({ emoji, title, desc, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{desc}</Text>
    </Pressable>
  );
}

export default function RegisterChoiceScreen({ navigation }) {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Quel type de compte ?</Text>
      <Text style={styles.subtitle}>Vous pourrez compléter votre profil plus tard.</Text>

      <View style={{ marginTop: spacing.lg, gap: 16 }}>
        <ChoiceCard
          emoji="🏠"
          title="Je suis un particulier"
          desc="Je cherche une garde de confiance pour mon animal."
          onPress={() => navigation.navigate('RegisterCustomer')}
        />
        <ChoiceCard
          emoji="💼"
          title="Je suis un professionnel"
          desc="Je propose des services de garde, promenade ou pension."
          onPress={() => navigation.navigate('RegisterCompany')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 6 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  emoji: { fontSize: 32, marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  cardDesc: { color: colors.textMuted, marginTop: 4 },
});
