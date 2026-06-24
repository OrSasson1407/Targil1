import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { Redirect } from 'expo-router';
import { C } from '../../src/components/colors';

function Icon({ symbol, color }) {
  return <Text style={{ fontSize: 22, color }}>{symbol}</Text>;
}

export default function TabsLayout() {
  const { user, loading } = useAuth();
  if (!loading && !user) return <Redirect href="/auth/login" />;

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: C.blue,
      tabBarInactiveTintColor: C.sub,
      tabBarStyle: { borderTopColor: C.border, backgroundColor: C.white, height: 60, paddingBottom: 8 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="home"    options={{ title: 'Home',    tabBarIcon: ({ color }) => <Icon symbol="🏠" color={color}/> }} />
      <Tabs.Screen name="orders"  options={{ title: 'Orders',  tabBarIcon: ({ color }) => <Icon symbol="📋" color={color}/> }} />
      <Tabs.Screen name="manage"  options={{ title: 'Manage',  tabBarIcon: ({ color }) => <Icon symbol="⚙️" color={color}/> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Icon symbol="👤" color={color}/> }} />
    </Tabs>
  );
}