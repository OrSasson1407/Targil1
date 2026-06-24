import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Alert, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { api } from '../../src/api';
import { C } from '../../src/components/colors';

const RULES = [
  { key: 'username', label: 'Username',         required: true },
  { key: 'password', label: 'Password',         required: true, minLen: 8, mixed: true },
  { key: 'confirm',  label: 'Confirm Password', required: true },
  { key: 'name',     label: 'Full Name',        required: true },
  { key: 'phone',    label: 'Phone',            required: true, phonePattern: true },
  { key: 'address',  label: 'Address',          required: true },
];

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm]     = useState({ username:'', password:'', confirm:'', name:'', phone:'', address:'' });
  const [image, setImage]   = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission required', 'Allow photo access to pick a profile picture.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1,1], quality: 0.7 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const validate = () => {
    const e = {};
    RULES.forEach(r => {
      const v = form[r.key];
      if (r.required && !v.trim()) { e[r.key] = r.label + ' is required'; return; }
      if (r.minLen && v.length < r.minLen) { e[r.key] = 'Minimum ' + r.minLen + ' characters'; return; }
      if (r.mixed && !/[a-zA-Z]/.test(v)) { e[r.key] = 'Must contain letters'; return; }
      if (r.mixed && !/[0-9]/.test(v))    { e[r.key] = 'Must contain numbers'; return; }
      if (r.phonePattern && !/^[0-9+\-\s]{7,}$/.test(v)) { e[r.key] = 'Enter a valid phone number'; return; }
    });
    if (!e.confirm && form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.register({ username: form.username, password: form.password, name: form.name, phone: form.phone, address: form.address, imageUrl: image || '' });
      Alert.alert('Success', 'Account created! Please sign in.', [{ text: 'OK', onPress: () => router.replace('/auth/login') }]);
    } catch (err) {
      Alert.alert('Registration failed', err.message);
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={s.back}><Text style={s.backTxt}>← Back</Text></TouchableOpacity>
        <Text style={s.title}>Create account</Text>

        <TouchableOpacity style={s.avatarBox} onPress={pickImage}>
          {image
            ? <Image source={{ uri: image }} style={s.avatar} />
            : <View style={s.avatarPlaceholder}><Text style={s.avatarTxt}>+ Photo</Text></View>
          }
        </TouchableOpacity>

        {RULES.map(r => (
          <View key={r.key}>
            <Text style={s.label}>{r.label}</Text>
            <TextInput
              style={[s.input, errors[r.key] && s.inputErr]}
              placeholder={r.label}
              secureTextEntry={r.key === 'password' || r.key === 'confirm'}
              autoCapitalize={r.key === 'username' ? 'none' : 'words'}
              keyboardType={r.key === 'phone' ? 'phone-pad' : 'default'}
              value={form[r.key]}
              onChangeText={v => set(r.key, v)}
            />
            {errors[r.key] && <Text style={s.err}>{errors[r.key]}</Text>}
          </View>
        ))}

        <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff"/> : <Text style={s.btnTxt}>Create account</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:              { flex: 1, backgroundColor: C.white },
  inner:             { padding: 28, paddingTop: 56 },
  back:              { marginBottom: 12 },
  backTxt:           { color: C.blue, fontSize: 15 },
  title:             { fontSize: 26, fontWeight: '700', color: C.text, marginBottom: 20 },
  avatarBox:         { alignSelf: 'center', marginBottom: 20 },
  avatar:            { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
  avatarTxt:         { color: C.blue, fontWeight: '600' },
  label:             { fontSize: 14, fontWeight: '600', color: C.sub, marginBottom: 6, marginTop: 10 },
  input:             { borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 14, fontSize: 15, backgroundColor: C.bg },
  inputErr:          { borderColor: C.red },
  err:               { color: C.red, fontSize: 12, marginTop: 3 },
  btn:               { backgroundColor: C.blue, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  btnTxt:            { color: C.white, fontWeight: '700', fontSize: 16 },
});