import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { Transaction } from '@/types';
import { useAuthStore } from '@/store/authStore';

interface Props {
  transaction: Transaction;
}

const typeIcon: Record<string, any> = {
  transfer: 'arrow-up-circle',
  deposit: 'download',
  withdrawal: 'arrow-up',
  refund: 'refresh-circle',
};

export function TransactionItem({ transaction }: Props) {
  const userId = useAuthStore((s) => s.userId);
  const isReceived = transaction.receiver?._id === userId;
  const other = isReceived ? transaction.sender : transaction.receiver;
  const name = other ? `${other.firstname} ${other.lastname}` : '—';
  const sign = isReceived ? '+' : '-';
  const amountColor = isReceived ? colors.success : colors.text;
  const date = new Date(transaction.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const statusColor =
    transaction.status === 'Success' ? colors.success :
    transaction.status === 'Canceled' ? colors.error :
    transaction.status === 'Refunded' ? colors.warning :
    colors.textSecondary;

  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: isReceived ? 'rgba(16,185,129,0.15)' : 'rgba(79,70,229,0.15)' }]}>
        <Ionicons name={typeIcon[transaction.type] ?? 'swap-horizontal'} size={20} color={isReceived ? colors.success : colors.primaryLight} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.date}>{date} · <Text style={[styles.status, { color: statusColor }]}>{transaction.status}</Text></Text>
      </View>
      <Text style={[styles.amount, { color: amountColor }]}>
        {sign}{transaction.currency} {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, gap: 14 },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { color: colors.text, fontSize: 15, fontWeight: '500', marginBottom: 3 },
  date: { color: colors.textMuted, fontSize: 12 },
  status: { fontWeight: '600' },
  amount: { fontSize: 15, fontWeight: '700' },
});
