import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';

export default function TextField({ label, error, style, ...props }) {
  return (
    <View style={[{ marginBottom: spacing.md }, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error && { borderColor: colors.danger }]}
        {...props}
      />
      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.text, marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  err: { color: colors.danger, marginTop: 4, fontSize: 12 },
});
