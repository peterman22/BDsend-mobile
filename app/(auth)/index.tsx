import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>B</Text>
        </View>
        <Text style={styles.appName}>BDsend</Text>
        <Text style={styles.tagline}>Send money fast,{'\n'}anywhere in the world.</Text>
      </View>
      <View style={styles.features}>
        {[
          { icon: '⚡', label: 'Instant transfers' },
          { icon: '🔒', label: 'Bank-grade security' },
          { icon: '🌍', label: 'Global coverage' },
        ].map((f) => (
          <View key={f.label} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureLabel}>{f.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.cta}>
        <Button title="Create an Account" onPress={() => router.push('/(auth)/register')} />
        <Button
          title="Sign In"
          variant="ghost"
          onPress={() => router.push('/(auth)/sign-in')}
          style={styles.signInBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  logoContainer: {
    width: 88, height: 88, borderRadius: 28, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 12,
  },
  logoText: { color: colors.white, fontSize: 44, fontWeight: '800' },
  appName: { color: colors.white, fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  tagline: { color: colors.textSecondary, fontSize: 18, textAlign: 'center', lineHeight: 28 },
  features: { gap: 16, paddingVertical: 32 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { fontSize: 22 },
  featureLabel: { color: colors.textSecondary, fontSize: 16 },
  cta: { paddingBottom: 16, gap: 8 },
  signInBtn: {},
});
