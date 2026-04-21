import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/constants/colors';
import { authApi } from '@/api/auth';

export default function ForgotPasswordScreen() {
  const { email: paramEmail, verified } = useLocalSearchParams<{ email?: string; verified?: string }>();
  const [email, setEmail] = useState(paramEmail ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const isVerified = verified === '1';

  const handleSendOtp = async () => {
    if (!email) return Alert.alert('Enter your email address');
    setLoading(true);
    try {
      await authApi.getOtp(email);
      router.push({ pathname: '/(auth)/otp', params: { email, next: 'reset-password' } });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Could not send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (password.length < 8) return Alert.alert('Password must be at least 8 characters');
    if (password !== confirm) return Alert.alert('Passwords do not match');
    setLoading(true);
    try {
      await authApi.resetPassword(email, password);
      Alert.alert('Success', 'Password reset successfully.', [{ text: 'Sign In', onPress: () => router.replace('/(auth)/sign-in') }]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>{isVerified ? 'New password' : 'Forgot password'}</Text>
        <Text style={styles.subtitle}>
          {isVerified ? 'Create a new secure password' : 'Enter your email and we\'ll send a reset code'}
        </Text>
        {!isVerified ? (
          <>
            <Input label="Email" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} placeholder="you@example.com" />
            <Button title="Send Reset Code" onPress={handleSendOtp} loading={loading} />
          </>
        ) : (
          <>
            <Input label="New Password" icon="lock-closed-outline" secureTextEntry value={password} onChangeText={setPassword} placeholder="Min. 8 characters" />
            <Input label="Confirm Password" icon="lock-closed-outline" secureTextEntry value={confirm} onChangeText={setConfirm} placeholder="Repeat password" />
            <Button title="Reset Password" onPress={handleReset} loading={loading} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  back: { padding: 20, paddingBottom: 0 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 12, gap: 16 },
  title: { color: colors.white, fontSize: 28, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 8 },
});
