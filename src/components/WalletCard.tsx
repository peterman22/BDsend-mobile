import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { User } from '@/types';

interface Props {
  user: User;
  onSend: () => void;
  onRequest: () => void;
  onTopUp: () => void;
}

export function WalletCard({ user, onSend, onRequest, onTopUp }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>Total Balance</Text>
        <View style={styles.kycBadge}>
          <Ionicons
            name={user.kycStatus === 'approved' ? 'shield-checkmark' : 'shield-outline'}
            size={12}
            color={user.kycStatus === 'approved' ? colors.success : colors.textSecondary}
          />
          <Text style={[styles.kycText, user.kycStatus === 'approved' && styles.kycApproved]}>
            {user.kycStatus === 'approved' ? 'Verified' : 'Unverified'}
          </Text>
        </View>
      </View>
      <Text style={styles.amount}>
        {user.currency} {user.wallet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Text>
      <Text style={styles.receivingId}>ID: {user.receivingId}</Text>
      <View style={styles.actions}>
        <Action icon="arrow-up" label="Send" onPress={onSend} />
        <Action icon="arrow-down" label="Request" onPress={onRequest} />
        <Action icon="add" label="Top Up" onPress={onTopUp} />
      </View>
    </View>
  );
}

function Action({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={20} color={colors.white} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500' },
  kycBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  kycText: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600' },
  kycApproved: { color: colors.success },
  amount: { color: colors.white, fontSize: 36, fontWeight: '700', letterSpacing: -0.5, marginBottom: 4 },
  receivingId: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 24 },
  actions: { flexDirection: 'row', justifyContent: 'space-around' },
  actionBtn: { alignItems: 'center', gap: 8 },
  actionIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  actionLabel: { color: colors.white, fontSize: 12, fontWeight: '500' },
});
