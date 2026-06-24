import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, SafeAreaView, Modal, ScrollView, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../../src/api';
import { useCart } from '../../../src/context/CartContext';
import { useAuth } from '../../../src/context/AuthContext';
import { C } from '../../../src/components/colors';

function ProductCard({ item, onAdd }) {
  return (
    <View style={s.card}>
      <View style={s.cardLeft}>
        <Text style={s.pName}>{item.name}</Text>
        {item.description ? <Text style={s.pDesc} numberOfLines={2}>{item.description}</Text> : null}
        {item.category ? <Text style={s.pCat}>{item.category}</Text> : null}
        <Text style={s.pPrice}>₪{item.price}</Text>
      </View>
      <TouchableOpacity style={s.addBtn} onPress={onAdd}>
        <Text style={s.addTxt}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { items, restaurantId, addItem, removeItem, clearCart, total } = useCart();
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [cartOpen, setCartOpen]     = useState(false);
  const [placing, setPlacing]       = useState(false);

  const load = useCallback(async () => {
    try {
      const [r, p] = await Promise.all([api.getRestaurant(id), api.getProducts(id)]);
      setRestaurant(r); setProducts(p || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const cartItems = items;
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const handleAdd = (product) => {
    if (restaurantId && restaurantId !== id) {
      Alert.alert('New cart?', 'Adding from a different restaurant will clear your current cart.', [
        { text: 'Cancel' },
        { text: 'Clear & add', onPress: () => { clearCart(); addItem(product, id); } },
      ]);
    } else {
      addItem(product, id);
    }
  };

  const placeOrder = async () => {
    if (!cartItems.length) return;
    setPlacing(true);
    try {
      await api.createOrder({ restaurantId: id, items: cartItems.map(i => ({ productId: i.productId, quantity: i.quantity })), deliveryAddress: '' });
      clearCart();
      setCartOpen(false);
      Alert.alert('Order placed!', 'Your order is on its way 🎉', [{ text: 'OK', onPress: () => router.push('/(tabs)/orders') }]);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setPlacing(false); }
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={C.blue}/></View>;

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <View style={s.headerInfo}>
          <Text style={s.rName}>{restaurant?.name}</Text>
          <Text style={s.rSub}>{restaurant?.cuisineType || ''}</Text>
        </View>
        {cartCount > 0 && (
          <TouchableOpacity style={s.cartBtn} onPress={() => setCartOpen(true)}>
            <Text style={s.cartTxt}>🛒 {cartCount}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={products}
        keyExtractor={i => i.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={<Text style={s.empty}>No dishes available</Text>}
        renderItem={({ item }) => <ProductCard item={item} onAdd={() => handleAdd(item)}/>}
      />

      {/* Cart Modal */}
      <Modal visible={cartOpen} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={s.root}>
          <View style={s.cartHeader}>
            <TouchableOpacity onPress={() => setCartOpen(false)}><Text style={s.cartClose}>✕</Text></TouchableOpacity>
            <Text style={s.cartTitle}>Your cart</Text>
            <TouchableOpacity onPress={clearCart}><Text style={s.cartClear}>Clear</Text></TouchableOpacity>
          </View>
          <ScrollView style={s.cartBody}>
            {cartItems.map(ci => (
              <View key={ci.productId} style={s.cartItem}>
                <Text style={s.ciName}>{ci.name}</Text>
                <Text style={s.ciQty}>×{ci.quantity}</Text>
                <Text style={s.ciPrice}>₪{(ci.price * ci.quantity).toFixed(2)}</Text>
                <TouchableOpacity onPress={() => removeItem(ci.productId)}><Text style={s.ciDel}>🗑</Text></TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View style={s.cartFooter}>
            <Text style={s.totalTxt}>Total: ₪{total.toFixed(2)}</Text>
            <TouchableOpacity style={s.orderBtn} onPress={placeOrder} disabled={placing}>
              {placing ? <ActivityIndicator color="#fff"/> : <Text style={s.orderTxt}>Place order</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: C.bg },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:     { backgroundColor: C.blue, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  backBtn:    { marginRight: 10 },
  backTxt:    { color: C.white, fontSize: 22, fontWeight: '700' },
  headerInfo: { flex: 1 },
  rName:      { color: C.white, fontSize: 17, fontWeight: '800' },
  rSub:       { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  cartBtn:    { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  cartTxt:    { color: C.white, fontWeight: '700' },
  list:       { padding: 14, paddingBottom: 40 },
  empty:      { textAlign: 'center', color: C.sub, marginTop: 60, fontSize: 16 },
  card:       { backgroundColor: C.white, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 5, shadowOffset: { width:0, height:2 } },
  cardLeft:   { flex: 1, marginRight: 12 },
  pName:      { fontSize: 15, fontWeight: '700', color: C.text },
  pDesc:      { color: C.sub, fontSize: 12, marginTop: 2 },
  pCat:       { color: C.blue, fontSize: 11, marginTop: 4 },
  pPrice:     { fontSize: 15, fontWeight: '700', color: C.blue, marginTop: 6 },
  addBtn:     { backgroundColor: C.blue, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  addTxt:     { color: C.white, fontSize: 24, lineHeight: 34 },
  cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: C.border },
  cartClose:  { fontSize: 18, color: C.sub },
  cartTitle:  { fontSize: 18, fontWeight: '700', color: C.text },
  cartClear:  { color: C.red, fontWeight: '600' },
  cartBody:   { flex: 1, padding: 16 },
  cartItem:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 10, padding: 12, marginBottom: 8, elevation: 1 },
  ciName:     { flex: 1, fontSize: 14, color: C.text },
  ciQty:      { color: C.sub, marginRight: 8 },
  ciPrice:    { fontWeight: '700', color: C.blue, marginRight: 10 },
  ciDel:      { fontSize: 16 },
  cartFooter: { padding: 20, borderTopWidth: 1, borderColor: C.border, backgroundColor: C.white },
  totalTxt:   { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 14 },
  orderBtn:   { backgroundColor: C.blue, borderRadius: 12, padding: 16, alignItems: 'center' },
  orderTxt:   { color: C.white, fontWeight: '700', fontSize: 16 },
});