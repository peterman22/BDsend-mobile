import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

type Variant = 'success' | 'error' | 'warning' | 'info' | 'muted';

interface Props {
  label: string;
  variant?: Variant;
}

const variantStyles: Record<Variant, { bg: string; text: string }> = {
  success: { bg: 'rgba(16,185,129,0.15)', text: colors.success },
  error: { bg: 'rgba(239,68,68,0.15)', text: colors.error },
  warning: { bg: 'rgba(245,158,11,0.15)', text: colors.warning },
  info: { bg: 'rgba(79,70,229,0.15)', text: colors.primaryLight },
  muted: { bg: colors.cardAlt, text: colors.textSecondary },
};

export function Badge({ label, variant = 'info' }: Props) {
  const v = variantStyles[variant];
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }]}>
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  text: { fontSize: 12, fontWeight: '600' },
});
