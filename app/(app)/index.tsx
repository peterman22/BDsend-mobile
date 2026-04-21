import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { WalletCard } from '@/components/WalletCard';
import { TransactionItem } from '@/components/TransactionItem';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { userApi } from '@/api/user';
import { paymentApi } from '@/api/payment';
import { useAuthStore } from '@/store/authStore';

export default function HomeScreen() {
  const setUser = useAuthStore((s) => s.setUser);

  const { data: userData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await userApi.getMe();
      setUser(res.data.user);
      return res.data.user;
    },
  });

  const { data: recentData } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => paymentApi.getRecentTransactions().then((r) => r.data.history),
  });

  const user = userData;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()},</Text>
            <Text style={styles.name}>{user?.firstname} {user?.lastname}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Wallet */}
        {user && (
          <WalletCard
            user={user}
            onSend={() => router.push('/(app)/send')}
            onRequest={() => router.push('/(app)/requests')}
            onTopUp={() => router.push('/(app)/send')}
          />
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Total Sent" value={user?.totalwithdrawl ?? 0} currency={user?.currency ?? 'USD'} color={colors.error} />
          <StatCard label="Total Received" value={user?.totaldeposit ?? 0} currency={user?.currency ?? 'USD'} color={colors.success} />
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/history')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {recentData && recentData.length > 0 ? (
            <Card padded={false} style={styles.txList}>
              {recentData.map((tx, idx) => (
                <View key={tx._id}>
                  <TransactionItem transaction={tx} />
                  {idx < recentData.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </Card>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={36} color={colors.textMuted} />
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, currency, color }: { label: string; value: number; currency: string; color: string }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{currency} {value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
    </Card>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  greeting: { color: colors.textSecondary, fontSize: 13 },
  name: { color: colors.white, fontSize: 20, fontWeight: '700' },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginTop: 20 },
  statCard: { flex: 1, gap: 4 },
  statLabel: { color: colors.textSecondary, fontSize: 12 },
  statValue: { fontSize: 16, fontWeight: '700' },
  section: { paddingHorizontal: 20, marginTop: 24, paddingBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: colors.white, fontSize: 17, fontWeight: '700' },
  seeAll: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  txList: { overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 20 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { color: colors.textMuted, fontSize: 14 },
});
