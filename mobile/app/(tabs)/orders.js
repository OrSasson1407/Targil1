import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Alert, SafeAreaView, RefreshControl, LayoutAnimation,
  Platform, UIManager,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '../../src/api';
import { C } from '../../src/components/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental)
  UIManager.setLayoutAnimationEnabledExperimental(true);

const STATUS_STYLE = {
  pending:   { bg: '#FFF8E1', text: '#F59E0B' },
  confirmed: { bg: '#E0F2FE', text: '#0284C7' },
  delivered: { bg: '#DCFCE7', text: '#16A34A' },
  cancelled: { bg: '#FEE2E2', text: '#DC2626' },
};

function OrderCard({ item, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const ss = STATUS_STYLE[item.status] || STATUS_STYLE.pending;
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(p => !p);
  };
  return (
    <View style={s.card}>
      <TouchableOpacity style={s.cardHeader} onPress={toggle} activeOpacity={0.8}>
        <View style={s.cardHeaderLeft}>
          <Text style={s.orderNum}>#{item.id.slice(-6).toUpperCase()}</Text>
          {item.restaurantName ? <Text style={s.restName}>{item.restaurantName}</Text> : null}
        </View>
        <View style={[s.badge, { backgroundColor: ss.bg }]}>
          <Text style={[s.badgeTxt, { color: ss.text }]}>{item.status}</Text>
        </View>
        <Text style={s.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      <View style={s.summary}>
        <Text style={s.summaryTxt}>
          {item.items.length} item{item.items.length !== 1 ? 's' : ''}
          {(item.total ?? 0) > 0 ? `  ·  ₪${item.total.toFixed(2)}` : ''}
        </Text>
        <Text style={s.dateTxt}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
      {expanded && (
        <View style={s.detail}>
          {item.deliveryAddress ? <Text style={s.addrTxt}>📍 {item.deliveryAddress}</Text> : null}
          {item.items.map((ci, idx) => (
            <View key={idx} style={s.lineItem}>
              <Text style={s.liName} numberOfLines={1}>{ci.name || 'Item'}</Text>
              <Text style={s.liQty}>×{ci.quantity}</Text>
              {ci.price > 0 ? <Text style={s.liPrice}>₪{(ci.price * ci.quantity).toFixed(2)}</Text> : null}
            </View>
          ))}
          {item.status === 'pending' && (
            <TouchableOpacity style={s.cancelBtn} onPress={onDelete}>
              <Text style={s.cancelTxt}>Cancel order</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

export default function OrdersScreen() {
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    async function fetch() {
      try { setOrders((await api.getOrders()) || []); }
      catch { /* ignore */ }
      finally { setLoading(false); setRefreshing(false); }
    }
    fetch();
  }, []);

  useFocusEffect(load);

  const handleDelete = (id) => {
    Alert.alert('Cancel order', 'Are you sure you want to cancel this order?', [
      { text: 'No' },
      { text: 'Yes, cancel', style: 'destructive', onPress: async () => {
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
        <Text style={s.headerSub}>{orders.length} order{orders.length !== 1 ? 's' : ''}</Text>
      </View>
      <FlatList
        data={[...orders].reverse()}
        keyExtractor={i => i.id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[C.blue]}/>}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Text style={s.emptyEmoji}>🛍️</Text>
            <Text style={s.emptyTitle}>No orders yet</Text>
            <Text style={s.emptySub}>Your completed orders will appear here</Text>
          </View>
        }
        renderItem={({ item }) => <OrderCard item={item} onDelete={() => handleDelete(item.id)} />}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:      { backgroundColor: C.blue, paddingVertical: 16, paddingHorizontal: 20 },
  headerTitle: { color: C.white, fontSize: 22, fontWeight: '800' },
  headerSub:   { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 },
  list:        { padding: 14, paddingBottom: 40 },
  emptyBox:    { alignItems: 'center', marginTop: 80 },
  emptyEmoji:  { fontSize: 56, marginBottom: 12 },
  emptyTitle:  { fontSize: 18, fontWeight: '700', color: C.text },
  emptySub:    { color: C.sub, fontSize: 14, marginTop: 6, textAlign: 'center' },
  card:        { backgroundColor: C.white, borderRadius: 14, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', padding: 14, paddingBottom: 8 },
  cardHeaderLeft: { flex: 1 },
  orderNum:    { fontSize: 15, fontWeight: '700', color: C.text },
  restName:    { fontSize: 13, color: C.sub, marginTop: 2 },
  badge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginRight: 8 },
  badgeTxt:    { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  chevron:     { color: C.sub, fontSize: 12 },
  summary:     { paddingHorizontal: 14, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryTxt:  { color: C.sub, fontSize: 13, fontWeight: '600' },
  dateTxt:     { color: C.sub, fontSize: 12 },
  detail:      { borderTopWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12 },
  addrTxt:     { color: C.sub, fontSize: 13, marginBottom: 10 },
  lineItem:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  liName:      { flex: 1, fontSize: 14, color: C.text },
  liQty:       { color: C.sub, fontSize: 13, marginRight: 8 },
  liPrice:     { fontSize: 13, fontWeight: '700', color: C.blue },
  cancelBtn:   { marginTop: 12, alignSelf: 'flex-start', backgroundColor: '#FEE2E2', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  cancelTxt:   { color: C.red, fontWeight: '600', fontSize: 13 },
});