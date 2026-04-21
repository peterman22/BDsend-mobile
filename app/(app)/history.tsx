import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { TransactionItem } from '@/components/TransactionItem';
import { colors } from '@/constants/colors';
import { paymentApi } from '@/api/payment';
import { Transaction } from '@/types';

type Filter = 'all' | 'transfer' | 'deposit' | 'withdrawal';

export default function HistoryScreen() {
  const [filter, setFilter] = useState<Filter>('all');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ['transactions', filter],
    queryFn: ({ pageParam = 1 }) => paymentApi.getTransactionHistory(pageParam, 20).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (last) => last.pagination.page < last.pagination.pages ? last.pagination.page + 1 : undefined,
  });

  const allTx: Transaction[] = (data?.pages.flatMap((p) => p.history) ?? [])
    .filter((tx) => filter === 'all' || tx.type === filter);

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />;
  };

  const filters: Filter[] = ['all', 'transfer', 'deposit', 'withdrawal'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => refetch()}>
          <Ionicons name="refresh-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={styles.filters}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : allTx.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No transactions</Text>
          <Text style={styles.emptyText}>Your transaction history will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={allTx}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <View>
              <TransactionItem transaction={item} />
              {index < allTx.length - 1 && <View style={styles.divider} />}
            </View>
          )}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { color: colors.white, fontSize: 26, fontWeight: '700' },
  refreshBtn: { padding: 8 },
  filters: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '600' },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
  list: { paddingBottom: 24, backgroundColor: colors.card, marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 20 },
});
