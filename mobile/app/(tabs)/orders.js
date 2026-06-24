import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Alert, SafeAreaView, RefreshControl,
} from 'react-native';
import { api } from '../../src/api';
import { C } from '../../src/components/colors';

function OrderCard({ item, onDelete }) {
  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.orderTitle}>Order #{item.id.slice(-6).toUpperCase()}</Text>
        <View style={[s.badge, item.status === 'pending' ? s.pending : s.done]}>
          <Text style={s.badgeTxt}>{item.status}</Text>
        </View>
      </View>
      <Text style={s.sub}>{item.items.length} item{item.items.length !== 1 ? 's' : ''}</Text>
      {item.deliveryAddress ? <Text style={s.sub}>📍 {item.deliveryAddress}</Text> : null}
      <Text style={s.date}>{new Date(item.createdAt).toLocaleString()}</Text>
      <TouchableOpacity style={s.deleteBtn} onPress={onDelete}>
        <Text style={s.deleteTxt}>Cancel order</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function OrdersScreen() {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setOrders((await api.getOrders()) || []); }
    catch { /* ignore */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (id) => {
    Alert.alert('Cancel order', 'Are you sure?', [
      { text: 'No' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        try { await api.deleteOrder(id); load(); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={C.blue}/></View>;

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>My Orders</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={i => i.id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[C.blue]}/>}
        ListEmptyComponent={<Text style={s.empty}>No orders yet</Text>}
        renderItem={({ item }) => <OrderCard item={item} onDelete={() => handleDelete(item.id)}/>}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:      { backgroundColor: C.blue, paddingVertical: 16, paddingHorizontal: 20 },
  headerTitle: { color: C.white, fontSize: 22, fontWeight: '800' },
  list:        { padding: 14, paddingBottom: 40 },
  empty:       { textAlign: 'center', color: C.sub, marginTop: 60, fontSize: 16 },
  card:        { backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width:0, height:2 } },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderTitle:  { fontSize: 15, fontWeight: '700', color: C.text },
  badge:       { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  pending:     { backgroundColor: '#FFF3CD' },
  done:        { backgroundColor: '#D4EDDA' },
  badgeTxt:    { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  sub:         { color: C.sub, fontSize: 13, marginBottom: 2 },
  date:        { color: C.sub, fontSize: 12, marginTop: 4 },
  deleteBtn:   { marginTop: 10, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#FDECEA' },
  deleteTxt:   { color: C.red, fontWeight: '600', fontSize: 13 },
});