import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing } from '../theme/colors';

export default function ScreenContainer({ children, scroll = true }) {
  const Inner = scroll ? ScrollView : SafeAreaView;
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Inner contentContainerStyle={scroll ? styles.scroll : undefined} style={{ flex: 1 }}>
          {children}
        </Inner>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
});
