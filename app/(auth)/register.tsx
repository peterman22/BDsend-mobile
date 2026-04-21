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

const schema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  phonenumber: z.string().min(7, 'Enter a valid phone number'),
  country: z.string().min(1, 'Country is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authApi.register(data);
      // Navigate to OTP to verify email before setting PIN
      router.push({ pathname: '/(auth)/otp', params: { email: data.email, next: 'set-pin' } });
    } catch (err: any) {
      Alert.alert('Registration Failed', err.response?.data?.message ?? 'Something went wrong.');
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
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join BDsend today</Text>
        <View style={styles.row}>
          <View style={styles.half}>
            <Controller control={control} name="firstname" render={({ field: { onChange, value } }) => (
              <Input label="First Name" value={value} onChangeText={onChange} error={errors.firstname?.message} placeholder="John" />
            )} />
          </View>
          <View style={styles.half}>
            <Controller control={control} name="lastname" render={({ field: { onChange, value } }) => (
              <Input label="Last Name" value={value} onChangeText={onChange} error={errors.lastname?.message} placeholder="Doe" />
            )} />
          </View>
        </View>
        <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
          <Input label="Email" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} error={errors.email?.message} placeholder="you@example.com" />
        )} />
        <Controller control={control} name="phonenumber" render={({ field: { onChange, value } }) => (
          <Input label="Phone Number" icon="call-outline" keyboardType="phone-pad" value={value} onChangeText={onChange} error={errors.phonenumber?.message} placeholder="+1 555 000 0000" />
        )} />
        <Controller control={control} name="country" render={({ field: { onChange, value } }) => (
          <Input label="Country" icon="globe-outline" value={value} onChangeText={onChange} error={errors.country?.message} placeholder="e.g. USA" />
        )} />
        <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
          <Input label="Password" icon="lock-closed-outline" secureTextEntry value={value} onChangeText={onChange} error={errors.password?.message} placeholder="Min. 8 characters" />
        )} />
        <Controller control={control} name="confirmPassword" render={({ field: { onChange, value } }) => (
          <Input label="Confirm Password" icon="lock-closed-outline" secureTextEntry value={value} onChangeText={onChange} error={errors.confirmPassword?.message} placeholder="Repeat password" />
        )} />
        <Button title="Continue" onPress={handleSubmit(onSubmit)} loading={loading} style={styles.submitBtn} />
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.link}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  back: { padding: 20, paddingBottom: 0 },
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
  title: { color: colors.white, fontSize: 30, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: colors.textSecondary, fontSize: 16, marginBottom: 28 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  submitBtn: { marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: colors.textSecondary, fontSize: 14 },
  link: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
