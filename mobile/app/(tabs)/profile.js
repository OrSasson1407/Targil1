import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { C } from '../../src/components/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel' },
      { text: 'Sign out', style: 'destructive', onPress: async () => {
        await logout();
        router.replace('/auth/login');
      }},
    ]);
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Profile</Text>
      </View>
      <View style={s.body}>
        <View style={s.avatar}><Text style={s.avatarTxt}>👤</Text></View>
        <Text style={s.uid}>User ID</Text>
        <Text style={s.uidVal}>{user?.userId}</Text>
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutTxt}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: C.bg },
  header:    { backgroundColor: C.blue, paddingVertical: 16, paddingHorizontal: 20 },
  headerTitle:{ color: C.white, fontSize: 22, fontWeight: '800' },
  body:      { flex: 1, alignItems: 'center', paddingTop: 60 },
  avatar:    { width: 90, height: 90, borderRadius: 45, backgroundColor: C.border, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarTxt: { fontSize: 40 },
  uid:       { color: C.sub, fontSize: 13 },
  uidVal:    { color: C.text, fontWeight: '600', fontSize: 14, marginBottom: 40 },
  logoutBtn: { backgroundColor: C.red, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12 },
  logoutTxt: { color: C.white, fontWeight: '700', fontSize: 16 },
});