import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>404</Text>
      <Text style={styles.subtitle}>This screen doesn't exist.</Text>
      <Link href="/(app)" style={styles.link}>Go to Home</Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { color: colors.white, fontSize: 48, fontWeight: '800' },
  subtitle: { color: colors.textSecondary, fontSize: 16 },
  link: { color: colors.primary, fontSize: 16, fontWeight: '600', marginTop: 8 },
});
