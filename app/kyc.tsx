import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { userApi } from '@/api/user';

const ID_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
  { value: 'drivers_license', label: "Driver's License" },
] as const;

type IdType = typeof ID_TYPES[number]['value'];

const kycVariant: Record<string, any> = {
  unverified: 'muted', pending: 'warning', approved: 'success', rejected: 'error',
};

export default function KycScreen() {
  const [idType, setIdType] = useState<IdType>('passport');
  const [idNumber, setIdNumber] = useState('');

  const { data: statusData } = useQuery({
    queryKey: ['kyc-status'],
    queryFn: () => userApi.getKycStatus().then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: () => userApi.submitKyc({ idType, idNumber }),
    onSuccess: () => Alert.alert('Submitted', "Your KYC is under review. We'll notify you once it's processed.", [{ text: 'OK', onPress: () => router.back() }]),
    onError: (e: any) => Alert.alert('Error', e.response?.data?.message ?? 'Submission failed.'),
  });

  const status = statusData?.kycStatus ?? 'unverified';
  const isApproved = status === 'approved';
  const isPending = status === 'pending';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Verification (KYC)</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Status banner */}
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Ionicons name={isApproved ? 'shield-checkmark' : 'shield-outline'} size={28} color={isApproved ? colors.success : colors.primary} />
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>KYC Status</Text>
              <Badge label={status.charAt(0).toUpperCase() + status.slice(1)} variant={kycVariant[status]} />
            </View>
          </View>
          {isApproved && <Text style={styles.statusDesc}>Your identity has been verified. You have full access to all features.</Text>}
          {isPending && <Text style={styles.statusDesc}>Your documents are under review. This usually takes 1-2 business days.</Text>}
          {status === 'rejected' && <Text style={[styles.statusDesc, { color: colors.error }]}>Your submission was rejected. Please re-submit with correct documents.</Text>}
          {status === 'unverified' && <Text style={styles.statusDesc}>Verify your identity to unlock higher transfer limits and full account access.</Text>}
        </Card>

        {!isApproved && !isPending && (
          <>
            <Text style={styles.sectionLabel}>Document Type</Text>
            <View style={styles.typeGrid}>
              {ID_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.typeCard, idType === t.value && styles.typeCardActive]}
                  onPress={() => setIdType(t.value)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="card-outline" size={22} color={idType === t.value ? colors.primary : colors.textMuted} />
                  <Text style={[styles.typeLabel, idType === t.value && styles.typeLabelActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Document Number"
              icon="barcode-outline"
              value={idNumber}
              onChangeText={setIdNumber}
              placeholder="Enter your document number"
            />

            <Card style={styles.noteCard}>
              <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.noteText}>
                For full verification, please have a clear photo of your ID and a selfie ready. Upload support coming soon.
              </Text>
            </Card>

            <Button
              title="Submit for Verification"
              onPress={() => {
                if (!idNumber.trim()) return Alert.alert('Enter your document number');
                mutation.mutate();
              }}
              loading={mutation.isPending}
              style={styles.btn}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  title: { color: colors.white, fontSize: 18, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 20 },
  statusCard: { gap: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  statusInfo: { gap: 6 },
  statusTitle: { color: colors.textSecondary, fontSize: 12, fontWeight: '500' },
  statusDesc: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  sectionLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  typeGrid: { flexDirection: 'row', gap: 10 },
  typeCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: 'center', gap: 8 },
  typeCardActive: { borderColor: colors.primary, backgroundColor: 'rgba(79,70,229,0.1)' },
  typeLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '500', textAlign: 'center' },
  typeLabelActive: { color: colors.primaryLight },
  noteCard: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  noteText: { flex: 1, color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  btn: {},
});
