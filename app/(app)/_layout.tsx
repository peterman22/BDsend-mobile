import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(focused: boolean, name: IconName, outlineName: IconName) {
  return <Ionicons name={focused ? name : outlineName} size={24} color={focused ? colors.primary : colors.textMuted} />;
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ focused }) => tabIcon(focused, 'home', 'home-outline') }}
      />
      <Tabs.Screen
        name="send"
        options={{ title: 'Send', tabBarIcon: ({ focused }) => tabIcon(focused, 'arrow-up-circle', 'arrow-up-circle-outline') }}
      />
      <Tabs.Screen
        name="requests"
        options={{ title: 'Requests', tabBarIcon: ({ focused }) => tabIcon(focused, 'swap-horizontal', 'swap-horizontal-outline') }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'History', tabBarIcon: ({ focused }) => tabIcon(focused, 'receipt', 'receipt-outline') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ focused }) => tabIcon(focused, 'person-circle', 'person-circle-outline') }}
      />
    </Tabs>
  );
}
