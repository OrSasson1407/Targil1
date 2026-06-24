import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Modal, ScrollView,
} from 'react-native';
import { api } from '../../src/api';
import { C } from '../../src/components/colors';

function Field({ label, value, onChangeText, placeholder, keyboardType, multiline }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={fm.label}>{label}</Text>
      <TextInput
        style={[fm.input, multiline && { height: 80, textAlignVertical: 'top' }]}
        placeholder={placeholder || label}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
      />
    </View>
  );
}

function RestaurantModal({ visible, initial, onClose, onSave }) {
  const blank = { name:'', address:'', phone:'', cuisineType:'', openingHours:'' };
  const [form, setForm] = useState(blank);
  useEffect(() => { setForm(initial ? { name: initial.name||'', address: initial.address||'', phone: initial.phone||'', cuisineType: initial.cuisineType||'', openingHours: initial.openingHours||'' } : blank); }, [initial, visible]);
  const set = (k,v) => setForm(f => ({...f, [k]: v}));
  const submit = () => {
    if (!form.name.trim()) { Alert.alert('Validation', 'Name is required'); return; }
    onSave(form);
  };
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={fm.root}>
        <View style={fm.bar}>
          <TouchableOpacity onPress={onClose}><Text style={fm.cancel}>Cancel</Text></TouchableOpacity>
          <Text style={fm.title}>{initial ? 'Edit Restaurant' : 'New Restaurant'}</Text>
          <TouchableOpacity onPress={submit}><Text style={fm.save}>Save</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={fm.body}>
          <Field label="Name *" value={form.name} onChangeText={v=>set('name',v)}/>
          <Field label="Address" value={form.address} onChangeText={v=>set('address',v)}/>
          <Field label="Phone" value={form.phone} onChangeText={v=>set('phone',v)} keyboardType="phone-pad"/>
          <Field label="Cuisine Type" value={form.cuisineType} onChangeText={v=>set('cuisineType',v)}/>
          <Field label="Opening Hours" value={form.openingHours} onChangeText={v=>set('openingHours',v)}/>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function ProductModal({ visible, initial, onClose, onSave }) {
  const blank = { name:'', description:'', price:'', category:'' };
  const [form, setForm] = useState(blank);
  useEffect(() => { setForm(initial ? { name: initial.name||'', description: initial.description||'', price: String(initial.price||''), category: initial.category||'' } : blank); }, [initial, visible]);
  const set = (k,v) => setForm(f => ({...f, [k]: v}));
  const submit = () => {
    if (!form.name.trim()) { Alert.alert('Validation', 'Name is required'); return; }
    if (!form.price || isNaN(Number(form.price))) { Alert.alert('Validation', 'Valid price is required'); return; }
    onSave({ ...form, price: Number(form.price) });
  };
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={fm.root}>
        <View style={fm.bar}>
          <TouchableOpacity onPress={onClose}><Text style={fm.cancel}>Cancel</Text></TouchableOpacity>
          <Text style={fm.title}>{initial ? 'Edit Dish' : 'New Dish'}</Text>
          <TouchableOpacity onPress={submit}><Text style={fm.save}>Save</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={fm.body}>
          <Field label="Name *" value={form.name} onChangeText={v=>set('name',v)}/>
          <Field label="Description" value={form.description} onChangeText={v=>set('description',v)} multiline/>
          <Field label="Price *" value={form.price} onChangeText={v=>set('price',v)} keyboardType="decimal-pad"/>
          <Field label="Category" value={form.category} onChangeText={v=>set('category',v)}/>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function ManageScreen() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState(null);
  const [products, setProducts]       = useState([]);
  const [rModal, setRModal]           = useState({ open: false, item: null });
  const [pModal, setPModal]           = useState({ open: false, item: null });

  const loadRestaurants = useCallback(async () => {
    try { setRestaurants((await api.getRestaurants()) || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  const loadProducts = useCallback(async (rId) => {
    try { setProducts((await api.getProducts(rId)) || []); } catch { setProducts([]); }
  }, []);

  useEffect(() => { loadRestaurants(); }, [loadRestaurants]);
  useEffect(() => { if (selected) loadProducts(selected.id); }, [selected, loadProducts]);

  const saveRestaurant = async (form) => {
    try {
      if (rModal.item) { await api.updateRestaurant(rModal.item.id, form); }
      else             { await api.createRestaurant(form); }
      setRModal({ open: false, item: null });
      loadRestaurants();
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const deleteRestaurant = (r) => {
    Alert.alert('Delete', 'Delete ' + r.name + '?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.deleteRestaurant(r.id); if (selected?.id === r.id) setSelected(null); loadRestaurants(); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const saveProduct = async (form) => {
    try {
      if (pModal.item) { await api.updateProduct(selected.id, pModal.item.id, form); }
      else             { await api.createProduct(selected.id, form); }
      setPModal({ open: false, item: null });
      loadProducts(selected.id);
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const deleteProduct = (p) => {
    Alert.alert('Delete', 'Delete ' + p.name + '?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.deleteProduct(selected.id, p.id); loadProducts(selected.id); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={C.blue}/></View>;

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Manage</Text>
      </View>

      <View style={s.split}>
        {/* Left: restaurants */}
        <View style={s.leftPane}>
          <View style={s.paneHeader}>
            <Text style={s.paneTitle}>Restaurants</Text>
            <TouchableOpacity onPress={() => setRModal({ open: true, item: null })} style={s.addBtn}>
              <Text style={s.addTxt}>+</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={restaurants}
            keyExtractor={i => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[s.rItem, selected?.id === item.id && s.rItemSel]}
                onPress={() => setSelected(item)}
              >
                <Text style={s.rName} numberOfLines={1}>{item.name}</Text>
                <View style={s.rActions}>
                  <TouchableOpacity onPress={() => setRModal({ open: true, item })}><Text style={s.editTxt}>✏️</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteRestaurant(item)}><Text style={s.delTxt}>🗑️</Text></TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={s.empty}>None</Text>}
          />
        </View>

        {/* Right: products */}
        <View style={s.rightPane}>
          {selected ? (
            <>
              <View style={s.paneHeader}>
                <Text style={s.paneTitle} numberOfLines={1}>{selected.name}</Text>
                <TouchableOpacity onPress={() => setPModal({ open: true, item: null })} style={s.addBtn}>
                  <Text style={s.addTxt}>+</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={products}
                keyExtractor={i => i.id}
                renderItem={({ item }) => (
                  <View style={s.pItem}>
                    <Text style={s.pName} numberOfLines={1}>{item.name}</Text>
                    <Text style={s.pPrice}>₪{item.price}</Text>
                    <View style={s.rActions}>
                      <TouchableOpacity onPress={() => setPModal({ open: true, item })}><Text style={s.editTxt}>✏️</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteProduct(item)}><Text style={s.delTxt}>🗑️</Text></TouchableOpacity>
                    </View>
                  </View>
                )}
                ListEmptyComponent={<Text style={s.empty}>No dishes</Text>}
              />
            </>
          ) : (
            <View style={s.center}><Text style={s.sub}>Select a restaurant</Text></View>
          )}
        </View>
      </View>

      <RestaurantModal visible={rModal.open} initial={rModal.item} onClose={() => setRModal({ open:false, item:null })} onSave={saveRestaurant}/>
      <ProductModal    visible={pModal.open} initial={pModal.item} onClose={() => setPModal({ open:false, item:null })} onSave={saveProduct}/>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: C.bg },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:     { backgroundColor: C.blue, paddingVertical: 16, paddingHorizontal: 20 },
  headerTitle:{ color: C.white, fontSize: 22, fontWeight: '800' },
  split:      { flex: 1, flexDirection: 'row' },
  leftPane:   { width: '42%', borderRightWidth: 1, borderColor: C.border, backgroundColor: C.white },
  rightPane:  { flex: 1, backgroundColor: C.bg },
  paneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderColor: C.border },
  paneTitle:  { fontWeight: '700', fontSize: 13, color: C.text, flex: 1 },
  addBtn:     { backgroundColor: C.blue, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  addTxt:     { color: C.white, fontSize: 20, lineHeight: 26 },
  rItem:      { padding: 10, borderBottomWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center' },
  rItemSel:   { backgroundColor: '#E8F4FB' },
  rName:      { flex: 1, fontSize: 13, color: C.text },
  rActions:   { flexDirection: 'row', gap: 6 },
  editTxt:    { fontSize: 14 },
  delTxt:     { fontSize: 14 },
  pItem:      { backgroundColor: C.white, margin: 8, borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  pName:      { flex: 1, fontSize: 13, color: C.text },
  pPrice:     { fontSize: 13, fontWeight: '700', color: C.blue, marginRight: 8 },
  empty:      { textAlign: 'center', color: C.sub, margin: 20, fontSize: 13 },
  sub:        { color: C.sub },
});

const fm = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.white },
  bar:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: C.border },
  cancel: { color: C.sub, fontSize: 16 },
  title:  { fontWeight: '700', fontSize: 17, color: C.text },
  save:   { color: C.blue, fontSize: 16, fontWeight: '700' },
  body:   { padding: 20 },
  label:  { fontSize: 13, fontWeight: '600', color: C.sub, marginBottom: 4 },
  input:  { borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: C.bg },
});