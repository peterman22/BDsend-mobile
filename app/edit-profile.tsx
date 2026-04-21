import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/constants/colors';
import { userApi } from '@/api/user';

const schema = z.object({
  firstname: z.string().min(1, 'Required'),
  lastname: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  phonenumber: z.string().min(7, 'Enter a valid number'),
  address: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function EditProfileScreen() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => userApi.getMe().then((r) => r.data.user) });

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstname: user?.firstname ?? '',
      lastname: user?.lastname ?? '',
      email: user?.email ?? '',
      phonenumber: user?.phonenumber ?? '',
      address: user?.address ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (d: FormData) => userApi.editUser(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      Alert.alert('Saved', 'Your profile has been updated.', [{ text: 'OK', onPress: () => router.back() }]);
    },
    onError: (e: any) => Alert.alert('Error', e.response?.data?.message ?? 'Could not save.'),
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.row}>
            <View style={styles.half}>
              <Controller control={control} name="firstname" render={({ field: { onChange, value } }) => (
                <Input label="First Name" value={value} onChangeText={onChange} error={errors.firstname?.message} />
              )} />
            </View>
            <View style={styles.half}>
              <Controller control={control} name="lastname" render={({ field: { onChange, value } }) => (
                <Input label="Last Name" value={value} onChangeText={onChange} error={errors.lastname?.message} />
              )} />
            </View>
          </View>
          <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
            <Input label="Email" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} error={errors.email?.message} />
          )} />
          <Controller control={control} name="phonenumber" render={({ field: { onChange, value } }) => (
            <Input label="Phone Number" icon="call-outline" keyboardType="phone-pad" value={value} onChangeText={onChange} error={errors.phonenumber?.message} />
          )} />
          <Controller control={control} name="address" render={({ field: { onChange, value } }) => (
            <Input label="Address (optional)" icon="location-outline" value={value} onChangeText={onChange} error={errors.address?.message} />
          )} />
          <Button title="Save Changes" onPress={handleSubmit((d) => mutation.mutate(d))} loading={mutation.isPending} style={styles.btn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  title: { color: colors.white, fontSize: 18, fontWeight: '700' },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  btn: { marginTop: 8 },
});
