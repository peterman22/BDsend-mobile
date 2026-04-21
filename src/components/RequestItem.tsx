import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { MoneyRequest } from '@/types';
import { useAuthStore } from '@/store/authStore';

interface Props {
  request: MoneyRequest;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function RequestItem({ request, onAccept, onReject }: Props) {
  const userId = useAuthStore((s) => s.userId);
  const isIncoming = request.requested_from._id === userId;
  const other = isIncoming ? request.requested_by : request.requested_from;
  const date = new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{other.firstname?.[0]}{other.lastname?.[0]}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{other.firstname} {other.lastname}</Text>
          <Text style={styles.meta}>{isIncoming ? 'Requesting from you' : 'You requested'} · {date}</Text>
        </View>
        <Text style={styles.amount}>${request.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
      </View>
      {request.note ? <Text style={styles.note}>{request.note}</Text> : null}
      {isIncoming && request.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => onReject?.(request._id)} activeOpacity={0.8}>
            <Ionicons name="close" size={16} color={colors.error} />
            <Text style={styles.rejectText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn} onPress={() => onAccept?.(request._id)} activeOpacity={0.8}>
            <Ionicons name="checkmark" size={16} color={colors.white} />
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  info: { flex: 1 },
  name: { color: colors.text, fontWeight: '600', fontSize: 15 },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  amount: { color: colors.accentLight, fontWeight: '700', fontSize: 16 },
  note: { color: colors.textSecondary, fontSize: 13, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  rejectBtn: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.error, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  rejectText: { color: colors.error, fontWeight: '600', fontSize: 14 },
  acceptBtn: { flex: 1, height: 40, borderRadius: 10, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  acceptText: { color: colors.white, fontWeight: '600', fontSize: 14 },
});
