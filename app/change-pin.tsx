import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { PinPad } from '@/components/PinPad';
import { colors } from '@/constants/colors';
import { userApi } from '@/api/user';

type Step = 'old' | 'new' | 'confirm';

export default function ChangePinScreen() {
  const [step, setStep] = useState<Step>('old');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: ({ oldpin, newpin }: { oldpin: string; newpin: string }) =>
      userApi.changePin(oldpin, newpin),
    onSuccess: () => {
      Alert.alert('PIN Changed', 'Your PIN has been updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (e: any) => {
      setError(e.response?.data?.message ?? 'Incorrect PIN.');
      setStep('old');
      setOldPin('');
      setNewPin('');
    },
  });

  const stepLabels: Record<Step, string> = {
    old: 'Enter current PIN',
    new: 'Enter new PIN',
    confirm: 'Confirm new PIN',
  };

  const handlePin = (pin: string) => {
    setError('');
    if (step === 'old') {
      setOldPin(pin);
      setStep('new');
    } else if (step === 'new') {
      setNewPin(pin);
      setStep('confirm');
    } else {
      if (pin !== newPin) {
        setError('PINs do not match. Try again.');
        setStep('new');
        setNewPin('');
        return;
      }
      mutation.mutate({ oldpin: oldPin, newpin: pin });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Change PIN</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.steps}>
        {(['old', 'new', 'confirm'] as Step[]).map((s, i) => (
          <View key={s} style={styles.stepDot}>
            <View style={[styles.dot, step === s && styles.dotActive, (step === 'new' && i === 0) || (step === 'confirm' && i < 2) ? styles.dotDone : null]} />
          </View>
        ))}
      </View>
      <PinPad label={stepLabels[step]} onComplete={handlePin} error={error} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  title: { color: colors.white, fontSize: 18, fontWeight: '700' },
  steps: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  stepDot: { alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 24 },
  dotDone: { backgroundColor: colors.success },
});
