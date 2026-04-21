import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { RequestItem } from '@/components/RequestItem';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/constants/colors';
import { userApi } from '@/api/user';

const schema = z.object({
  receiving_id: z.string().length(9, 'Receiving ID must be 9 digits'),
  amount: z.string().min(1).refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Enter a valid amount'),
  note: z.string().max(200).optional(),
});
type FormData = z.infer<typeof schema>;

export default function RequestsScreen() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'incoming' | 'sent'>('incoming');
  const [modal, setModal] = useState(false);

  const { data: incoming, refetch: refetchIn, isRefetching } = useQuery({
    queryKey: ['requests-incoming'],
    queryFn: () => userApi.getRequests().then((r) => r.data.requests),
  });

  const { data: sent, refetch: refetchSent } = useQuery({
    queryKey: ['requests-sent'],
    queryFn: () => userApi.getRequestsCreated().then((r) => r.data.requests),
  });

  const accept = useMutation({
    mutationFn: (id: string) => userApi.acceptRequest(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['requests-incoming'] }); queryClient.invalidateQueries({ queryKey: ['me'] }); },
    onError: (e: any) => Alert.alert('Error', e.response?.data?.message ?? 'Failed to accept.'),
  });

  const reject = useMutation({
    mutationFn: (id: string) => userApi.rejectRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests-incoming'] }),
    onError: (e: any) => Alert.alert('Error', e.response?.data?.message ?? 'Failed to reject.'),
  });

  const create = useMutation({
    mutationFn: (d: FormData) => userApi.createRequest(Number(d.receiving_id), Number(d.amount), d.note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests-sent'] });
      setModal(false);
      Alert.alert('Request sent!');
    },
    onError: (e: any) => Alert.alert('Error', e.response?.data?.message ?? 'Failed to create request.'),
  });

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({ resolver: zodResolver(schema) });

  const refetch = () => { refetchIn(); refetchSent(); };
  const list = tab === 'incoming' ? (incoming ?? []) : (sent ?? []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Requests</Text>
        <TouchableOpacity style={styles.fab} onPress={() => { reset(); setModal(true); }}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['incoming', 'sent'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'incoming' ? 'Incoming' : 'Sent'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {list.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="swap-horizontal-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No {tab} requests</Text>
          </View>
        ) : (
          list.map((req) => (
            <RequestItem
              key={req._id}
              request={req}
              onAccept={(id) => accept.mutate(id)}
              onReject={(id) => reject.mutate(id)}
            />
          ))
        )}
      </ScrollView>

      {/* Create Request Modal */}
      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Request Money</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Controller control={control} name="receiving_id" render={({ field: { onChange, value } }) => (
              <Input label="Their Receiving ID" icon="person-outline" keyboardType="numeric" maxLength={9} value={value} onChangeText={onChange} error={errors.receiving_id?.message} placeholder="9-digit ID" />
            )} />
            <Controller control={control} name="amount" render={({ field: { onChange, value } }) => (
              <Input label="Amount" icon="cash-outline" keyboardType="decimal-pad" value={value} onChangeText={onChange} error={errors.amount?.message} placeholder="0.00" />
            )} />
            <Controller control={control} name="note" render={({ field: { onChange, value } }) => (
              <Input label="Note (optional)" icon="chatbubble-outline" value={value} onChangeText={onChange} error={errors.note?.message} placeholder="What's this for?" />
            )} />
            <Button title="Send Request" onPress={handleSubmit((d) => create.mutate(d))} loading={create.isPending} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { color: colors.white, fontSize: 26, fontWeight: '700' },
  fab: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: colors.card, borderRadius: 12, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: colors.white },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: colors.textMuted, fontSize: 15 },
  modal: { flex: 1, backgroundColor: colors.bg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { color: colors.white, fontSize: 20, fontWeight: '700' },
  modalContent: { padding: 20, gap: 4 },
});
