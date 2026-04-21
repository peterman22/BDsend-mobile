import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/constants/colors';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  pin: z.string().length(4, 'PIN must be 4 digits'),
});

type FormData = z.infer<typeof schema>;

export default function SignInScreen() {
  const [loading, setLoading] = useState(false);
  const setTokens = useAuthStore((s) => s.setTokens);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.signIn(data);
      await setTokens({
        token: res.data.token,
        refreshToken: res.data.refreshToken,
        userId: res.data.user,
      });
      router.replace('/(app)');
    } catch (err: any) {
      Alert.alert('Sign In Failed', err.response?.data?.message ?? 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
        <View style={styles.form}>
          <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
            <Input label="Email" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} error={errors.email?.message} placeholder="you@example.com" />
          )} />
          <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
            <Input label="Password" icon="lock-closed-outline" secureTextEntry value={value} onChangeText={onChange} error={errors.password?.message} placeholder="Your password" />
          )} />
          <Controller control={control} name="pin" render={({ field: { onChange, value } }) => (
            <Input label="PIN" icon="keypad-outline" keyboardType="numeric" maxLength={4} value={value} onChangeText={onChange} error={errors.pin?.message} placeholder="4-digit PIN" />
          )} />
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgot}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
          <Button title="Sign In" onPress={handleSubmit(onSubmit)} loading={loading} style={styles.submitBtn} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.link}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  back: { padding: 20, paddingBottom: 0 },
  content: { paddingHorizontal: 24, paddingTop: 12 },
  title: { color: colors.white, fontSize: 30, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: colors.textSecondary, fontSize: 16, marginBottom: 32 },
  form: { gap: 4 },
  forgot: { alignSelf: 'flex-end', marginBottom: 8 },
  forgotText: { color: colors.primary, fontSize: 14 },
  submitBtn: { marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: colors.textSecondary, fontSize: 14 },
  link: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
