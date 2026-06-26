import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Alert, ActivityIndicator, ScrollView, Image,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { api } from '../../src/api';
import { C } from '../../src/components/colors';

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <View style={s.infoRow}>
      <Text style={s.infoIcon}>{icon}</Text>
      <View style={s.infoText}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);

  const loadProfile = useCallback(async () => {
    try { setProfile(await api.getMe()); }
    catch { /* silently fall back to userId display */ }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(loadProfile);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel' },
      { text: 'Sign out', style: 'destructive', onPress: async () => {
        await logout();
        router.replace('/auth/login');
      }},
    ]);
  };

  const initials = profile?.name
    ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={s.body}>
        {/* Avatar */}
        <View style={s.avatarWrap}>
          {profile?.imageUrl ? (
            <Image source={{ uri: profile.imageUrl }} style={s.avatarImg}/>
          ) : (
            <View style={s.avatarCircle}>
              {loading
                ? <ActivityIndicator color={C.white}/>
                : <Text style={s.avatarInitials}>{initials}</Text>
              }
            </View>
          )}
        </View>

        {/* Name */}
        {profile?.name ? (
          <Text style={s.name}>{profile.name}</Text>
        ) : null}
        <Text style={s.username}>@{profile?.username || user?.userId}</Text>

        {/* Info card */}
        <View style={s.card}>
          <InfoRow icon="📞" label="Phone"   value={profile?.phone}/>
          <InfoRow icon="📍" label="Address" value={profile?.address}/>
          <InfoRow icon="🆔" label="User ID" value={user?.userId}/>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutTxt}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: C.bg },
  header:         { backgroundColor: C.blue, paddingVertical: 16, paddingHorizontal: 20 },
  headerTitle:    { color: '#fff', fontSize: 22, fontWeight: '800' },

  body:           { alignItems: 'center', paddingTop: 32, paddingBottom: 48, paddingHorizontal: 20 },

  avatarWrap:     { marginBottom: 14 },
  avatarImg:      { width: 96, height: 96, borderRadius: 48 },
  avatarCircle:   { width: 96, height: 96, borderRadius: 48, backgroundColor: C.blue,
                    justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { color: '#fff', fontSize: 34, fontWeight: '800' },

  name:           { fontSize: 22, fontWeight: '800', color: C.text },
  username:       { fontSize: 14, color: C.sub, marginTop: 4, marginBottom: 24 },

  card:           { width: '100%', backgroundColor: C.white, borderRadius: 16,
                    paddingVertical: 6, paddingHorizontal: 16,
                    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06,
                    shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
                    marginBottom: 28 },

  infoRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
                    borderBottomWidth: 1, borderColor: C.border },
  infoIcon:       { fontSize: 20, marginRight: 14 },
  infoText:       { flex: 1 },
  infoLabel:      { fontSize: 12, color: C.sub, fontWeight: '600', marginBottom: 2 },
  infoValue:      { fontSize: 15, color: C.text, fontWeight: '500' },

  logoutBtn:      { width: '100%', backgroundColor: C.red, borderRadius: 14,
                    paddingVertical: 15, alignItems: 'center' },
  logoutTxt:      { color: '#fff', fontWeight: '700', fontSize: 16 },
});

