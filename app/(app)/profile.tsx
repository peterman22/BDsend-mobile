import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { userApi } from '@/api/user';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

function MenuItem({ icon, label, onPress, destructive }: { icon: any; label: string; onPress: () => void; destructive?: boolean }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, destructive && styles.menuIconDestructive]}>
        <Ionicons name={icon} size={18} color={destructive ? colors.error : colors.primary} />
      </View>
      <Text style={[styles.menuLabel, destructive && styles.menuLabelDestructive]}>{label}</Text>
      {!destructive && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
    </TouchableOpacity>
  );
}

const kycVariant: Record<string, any> = {
  unverified: 'muted',
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

export default function ProfileScreen() {
  const signOut = useAuthStore((s) => s.signOut);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => userApi.getMe().then((r) => r.data.user),
  });

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          if (refreshToken) await authApi.signOut(refreshToken).catch(() => {});
          await signOut();
          router.replace('/(auth)');
        },
      },
    ]);
  };

  const initials = user ? `${user.firstname?.[0] ?? ''}${user.lastname?.[0] ?? ''}` : '?';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.firstname} {user?.lastname}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Badge
            label={user?.kycStatus ? user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1) : 'Unverified'}
            variant={kycVariant[user?.kycStatus ?? 'unverified']}
          />
        </View>

        {/* Info card */}
        <Card style={styles.infoCard}>
          <InfoRow label="Receiving ID" value={String(user?.receivingId ?? '—')} />
          <InfoRow label="Country" value={user?.country ?? '—'} />
          <InfoRow label="Phone" value={user?.phonenumber ?? '—'} />
          <InfoRow label="Currency" value={user?.currency ?? 'USD'} last />
        </Card>

        {/* Menu */}
        <Card padded={false} style={styles.menu}>
          <MenuItem icon="create-outline" label="Edit Profile" onPress={() => router.push('/edit-profile')} />
          <View style={styles.divider} />
          <MenuItem icon="keypad-outline" label="Change PIN" onPress={() => router.push('/change-pin')} />
          <View style={styles.divider} />
          <MenuItem icon="shield-checkmark-outline" label="Identity Verification (KYC)" onPress={() => router.push('/kyc')} />
          <View style={styles.divider} />
          <MenuItem icon="log-out-outline" label="Sign Out" onPress={handleSignOut} destructive />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, gap: 20 },
  title: { color: colors.white, fontSize: 26, fontWeight: '700' },
  avatarSection: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  avatarText: { color: colors.white, fontSize: 32, fontWeight: '700' },
  name: { color: colors.white, fontSize: 22, fontWeight: '700' },
  email: { color: colors.textSecondary, fontSize: 14 },
  infoCard: { gap: 0, padding: 0 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { color: colors.textSecondary, fontSize: 14 },
  infoValue: { color: colors.text, fontSize: 14, fontWeight: '500' },
  menu: { overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 14 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(79,70,229,0.15)', alignItems: 'center', justifyContent: 'center' },
  menuIconDestructive: { backgroundColor: 'rgba(239,68,68,0.12)' },
  menuLabel: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '500' },
  menuLabelDestructive: { color: colors.error },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 70 },
});
