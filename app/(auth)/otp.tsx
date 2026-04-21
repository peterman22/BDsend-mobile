import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { authApi } from '@/api/auth';

export default function OtpScreen() {
  const { email, next } = useLocalSearchParams<{ email: string; next?: string }>();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const refs = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)];

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleChange = (val: string, idx: number) => {
    const arr = [...otp];
    arr[idx] = val.replace(/\D/g, '').slice(-1);
    setOtp(arr);
    if (val && idx < 3) refs[idx + 1].current?.focus();
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) refs[idx - 1].current?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 4) return Alert.alert('Enter the 4-digit code');
    setLoading(true);
    try {
      await authApi.verifyOtp(email, code);
      if (next === 'set-pin') {
        router.push({ pathname: '/(auth)/set-pin', params: { email } });
      } else if (next === 'reset-password') {
        router.push({ pathname: '/(auth)/forgot-password', params: { email, verified: '1' } });
      } else {
        router.replace('/(app)');
      }
    } catch {
      Alert.alert('Invalid Code', 'The code entered is incorrect or expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.getOtp(email);
      setResendTimer(60);
    } catch {
      Alert.alert('Could not resend OTP');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="mail-open-outline" size={40} color={colors.primary} />
        </View>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>We sent a 4-digit code to{'\n'}<Text style={styles.email}>{email}</Text></Text>
        <View style={styles.boxes}>
          {otp.map((val, idx) => (
            <TextInput
              key={idx}
              ref={refs[idx]}
              style={[styles.box, val && styles.boxFilled]}
              value={val}
              onChangeText={(v) => handleChange(v, idx)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, idx)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              selectionColor={colors.primary}
            />
          ))}
        </View>
        <Button title="Verify" onPress={handleVerify} loading={loading} style={styles.btn} />
        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't get a code? </Text>
          {resendTimer > 0 ? (
            <Text style={styles.timer}>Resend in {resendTimer}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  back: { padding: 20, paddingBottom: 0 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24, alignItems: 'center' },
  iconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(79,70,229,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { color: colors.white, fontSize: 26, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  email: { color: colors.text, fontWeight: '600' },
  boxes: { flexDirection: 'row', gap: 14, marginBottom: 36 },
  box: { width: 60, height: 66, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.cardAlt, color: colors.white, fontSize: 28, fontWeight: '700' },
  boxFilled: { borderColor: colors.primary, backgroundColor: 'rgba(79,70,229,0.1)' },
  btn: { width: '100%' },
  resendRow: { flexDirection: 'row', marginTop: 24 },
  resendText: { color: colors.textSecondary, fontSize: 14 },
  timer: { color: colors.textMuted, fontSize: 14 },
  resendLink: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
