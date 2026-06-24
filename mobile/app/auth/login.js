import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { C } from '../../src/components/colors';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = 'Username is required';
    if (!password)        e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(username.trim(), password);
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('Login failed', err.message);
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
        <View style={s.logoBox}>
          <Text style={s.logo}>W</Text>
          <Text style={s.brand}>Wolt</Text>
        </View>
        <Text style={s.title}>Sign in</Text>

        <Text style={s.label}>Username</Text>
        <TextInput
          style={[s.input, errors.username && s.inputErr]}
          placeholder="Enter username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        {errors.username && <Text style={s.err}>{errors.username}</Text>}

        <Text style={s.label}>Password</Text>
        <TextInput
          style={[s.input, errors.password && s.inputErr]}
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {errors.password && <Text style={s.err}>{errors.password}</Text>}

        <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff"/> : <Text style={s.btnTxt}>Sign in</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/register')} style={s.link}>
          <Text style={s.linkTxt}>Don't have an account? <Text style={s.linkBold}>Register</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.white },
  inner:   { padding: 28, paddingTop: 80 },
  logoBox: { alignItems: 'center', marginBottom: 24 },
  logo:    { fontSize: 56, fontWeight: '900', color: C.blue },
  brand:   { fontSize: 28, fontWeight: '700', color: C.blue, marginTop: -8 },
  title:   { fontSize: 26, fontWeight: '700', color: C.text, marginBottom: 24 },
  label:   { fontSize: 14, fontWeight: '600', color: C.sub, marginBottom: 6 },
  input:   { borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 4, backgroundColor: C.bg },
  inputErr:{ borderColor: C.red },
  err:     { color: C.red, fontSize: 12, marginBottom: 8 },
  btn:     { backgroundColor: C.blue, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  btnTxt:  { color: C.white, fontWeight: '700', fontSize: 16 },
  link:    { marginTop: 20, alignItems: 'center' },
  linkTxt: { color: C.sub, fontSize: 14 },
  linkBold:{ color: C.blue, fontWeight: '700' },
});