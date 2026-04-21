import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PinPad } from '@/components/PinPad';
import { colors } from '@/constants/colors';
import { authApi } from '@/api/auth';

export default function SetPinScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [step, setStep] = useState<'set' | 'confirm'>('set');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePin = async (pin: string) => {
    if (step === 'set') {
      setFirstPin(pin);
      setStep('confirm');
      setError('');
      return;
    }
    if (pin !== firstPin) {
      setError('PINs do not match. Try again.');
      setStep('set');
      setFirstPin('');
      return;
    }
    setLoading(true);
    try {
      await authApi.setPin(email, pin);
      router.replace('/(auth)/sign-in');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Could not set PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🔐</Text>
        </View>
        <Text style={styles.title}>{step === 'set' ? 'Set your PIN' : 'Confirm your PIN'}</Text>
        <Text style={styles.subtitle}>
          {step === 'set' ? 'Choose a 4-digit PIN to secure your account' : 'Re-enter your PIN to confirm'}
        </Text>
        <PinPad onComplete={handlePin} error={error} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  iconWrap: { marginBottom: 24 },
  icon: { fontSize: 52 },
  title: { color: colors.white, fontSize: 26, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 16 },
});
