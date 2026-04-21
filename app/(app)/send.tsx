import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { paymentApi } from '@/api/payment';
import { userApi } from '@/api/user';

const schema = z.object({
  receivingId: z.string().min(9, 'Receiving ID must be 9 digits').max(9),
  amount: z.string().min(1, 'Enter an amount').refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Enter a valid amount'),
  note: z.string().max(200).optional(),
});

type FormData = z.infer<typeof schema>;

export default function SendScreen() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [formData, setFormData] = useState<FormData | null>(null);

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => userApi.getMe().then((r) => r.data.user) });

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const transfer = useMutation({
    mutationFn: (d: FormData) =>
      paymentApi.transferMoney(Number(d.receivingId), Number(d.amount), d.note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      Alert.alert('✅ Success', 'Money sent successfully!');
      reset();
      setStep('form');
      setFormData(null);
    },
    onError: (err: any) => {
      Alert.alert('Transfer Failed', err.response?.data?.message ?? 'Something went wrong.');
      setStep('form');
    },
  });

  const onNext = (data: FormData) => {
    setFormData(data);
    setStep('confirm');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Send Money</Text>

          {/* Balance chip */}
          <View style={styles.balanceChip}>
            <Ionicons name="wallet-outline" size={14} color={colors.primary} />
            <Text style={styles.balanceText}>
              Balance: {user?.currency ?? 'USD'} {(user?.wallet ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          {step === 'form' ? (
            <>
              <Controller control={control} name="receivingId" render={({ field: { onChange, value } }) => (
                <Input label="Recipient ID" icon="person-outline" keyboardType="numeric" maxLength={9} value={value} onChangeText={onChange} error={errors.receivingId?.message} placeholder="9-digit receiving ID" />
              )} />
              <Controller control={control} name="amount" render={({ field: { onChange, value } }) => (
                <Input label={`Amount (${user?.currency ?? 'USD'})`} icon="cash-outline" keyboardType="decimal-pad" value={value} onChangeText={onChange} error={errors.amount?.message} placeholder="0.00" />
              )} />
              <Controller control={control} name="note" render={({ field: { onChange, value } }) => (
                <Input label="Note (optional)" icon="chatbubble-outline" value={value} onChangeText={onChange} error={errors.note?.message} placeholder="What's this for?" />
              )} />
              {user && (
                <View style={styles.limitInfo}>
                  <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.limitText}>Daily limit: {user.currency} {(user.dailyTransferLimit - user.dailyTransferUsed).toLocaleString('en-US', { minimumFractionDigits: 2 })} remaining</Text>
                </View>
              )}
              <Button title="Continue" onPress={handleSubmit(onNext)} style={styles.btn} />
            </>
          ) : (
            <Card style={styles.confirmCard}>
              <Text style={styles.confirmTitle}>Confirm Transfer</Text>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>To ID</Text>
                <Text style={styles.confirmValue}>{formData?.receivingId}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Amount</Text>
                <Text style={[styles.confirmValue, styles.confirmAmount]}>{user?.currency} {Number(formData?.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
              </View>
              {formData?.note && (
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Note</Text>
                  <Text style={styles.confirmValue}>{formData.note}</Text>
                </View>
              )}
              <View style={styles.confirmActions}>
                <Button title="Go Back" variant="secondary" fullWidth={false} style={styles.halfBtn} onPress={() => setStep('form')} />
                <Button title="Send Now" fullWidth={false} style={styles.halfBtn} loading={transfer.isPending} onPress={() => formData && transfer.mutate(formData)} />
              </View>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  title: { color: colors.white, fontSize: 26, fontWeight: '700', marginBottom: 16 },
  balanceChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(79,70,229,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 24 },
  balanceText: { color: colors.primaryLight, fontSize: 13, fontWeight: '600' },
  limitInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  limitText: { color: colors.textMuted, fontSize: 12 },
  btn: { marginTop: 8 },
  confirmCard: { gap: 16 },
  confirmTitle: { color: colors.white, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  confirmLabel: { color: colors.textSecondary, fontSize: 14 },
  confirmValue: { color: colors.text, fontSize: 14, fontWeight: '500' },
  confirmAmount: { color: colors.accentLight, fontSize: 18, fontWeight: '700' },
  confirmActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  halfBtn: { flex: 1 },
});
