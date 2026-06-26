import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, SafeAreaView, Modal, ScrollView,
  Alert, TextInput, StatusBar, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../src/api';
import { useCart } from '../../src/context/CartContext';
import { C } from '../../src/components/colors';

/* ─── Product card with inline qty controls ─────────────────────────── */
function ProductCard({ item, qty, onAdd, onDecrement }) {
  return (
    <View style={s.card}>
      <View style={s.cardLeft}>
        <Text style={s.pName}>{item.name}</Text>
        {item.description ? (
          <Text style={s.pDesc} numberOfLines={2}>{item.description}</Text>
        ) : null}
        {item.category ? (
          <View style={s.catPill}>
            <Text style={s.catTxt}>{item.category}</Text>
          </View>
        ) : null}
        <Text style={s.pPrice}>₪{Number(item.price).toFixed(2)}</Text>
      </View>

      <View style={s.qtyCol}>
        {qty > 0 ? (
          <View style={s.qtyRow}>
            <TouchableOpacity style={s.qtyBtn} onPress={onDecrement}>
              <Text style={s.qtyBtnTxt}>−</Text>
            </TouchableOpacity>
            <Text style={s.qtyNum}>{qty}</Text>
            <TouchableOpacity style={s.qtyBtn} onPress={onAdd}>
              <Text style={s.qtyBtnTxt}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={s.addBtn} onPress={onAdd}>
            <Text style={s.addTxt}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/* ─── Cart modal ─────────────────────────────────────────────────────── */
function CartModal({ visible, items, total, onClose, onClear, onDecrement, onAdd, onPlace, placing }) {
  const [address, setAddress] = useState('');

  const handlePlace = () => {
    if (!address.trim()) {
      Alert.alert('Delivery address', 'Please enter a delivery address.');
      return;
    }
    onPlace(address.trim());
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={cm.root}>
        {/* Header */}
        <View style={cm.bar}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top:8,bottom:8,left:8,right:8 }}>
            <Text style={cm.close}>✕</Text>
          </TouchableOpacity>
          <Text style={cm.title}>Your cart</Text>
          <TouchableOpacity onPress={onClear}>
            <Text style={cm.clearTxt}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Items */}
        <ScrollView style={cm.body} contentContainerStyle={{ paddingBottom: 16 }}>
          {items.map(ci => (
            <View key={ci.productId} style={cm.item}>
              <View style={cm.itemLeft}>
                <Text style={cm.iName}>{ci.name}</Text>
                <Text style={cm.iPrice}>₪{(ci.price * ci.quantity).toFixed(2)}</Text>
              </View>
              <View style={cm.qtyRow}>
                <TouchableOpacity style={cm.qBtn} onPress={() => onDecrement(ci.productId)}>
                  <Text style={cm.qBtnTxt}>−</Text>
                </TouchableOpacity>
                <Text style={cm.qNum}>{ci.quantity}</Text>
                <TouchableOpacity style={cm.qBtn} onPress={() => onAdd(ci)}>
                  <Text style={cm.qBtnTxt}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Delivery address */}
          <View style={cm.addrBlock}>
            <Text style={cm.addrLabel}>📍 Delivery address</Text>
            <TextInput
              style={cm.addrInput}
              placeholder="Enter your street address…"
              placeholderTextColor={C.sub}
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={cm.footer}>
          <View style={cm.totalRow}>
            <Text style={cm.totalLabel}>Total</Text>
            <Text style={cm.totalVal}>₪{total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={cm.orderBtn} onPress={handlePlace} disabled={placing}>
            {placing
              ? <ActivityIndicator color="#fff" />
              : <Text style={cm.orderTxt}>Place order</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

/* ─── Main screen ────────────────────────────────────────────────────── */
export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();
  const router  = useRouter();
  const { items, restaurantId, addItem, decrementItem, removeItem, clearCart, total } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [cartOpen, setCartOpen]     = useState(false);
  const [placing, setPlacing]       = useState(false);

  const load = useCallback(async () => {
    try {
      const [r, p] = await Promise.all([api.getRestaurant(id), api.getProducts(id)]);
      setRestaurant(r);
      setProducts(p || []);
    } catch (e) { Alert.alert('Error', 'Could not load restaurant. Please check your connection.'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleAdd = (product) => {
    if (restaurantId && restaurantId !== id) {
      Alert.alert(
        'Start new cart?',
        'Adding from a different restaurant will clear your current cart.',
        [
          { text: 'Cancel' },
          { text: 'Clear & add', style: 'destructive', onPress: () => { clearCart(); addItem(product, id); } },
        ]
      );
    } else {
      addItem(product, id);
    }
  };

  // addItem needs a product-shaped object; cart items have productId not id
  const handleAddFromCart = (ci) => {
    addItem({ id: ci.productId, name: ci.name, price: ci.price }, id);
  };

  const placeOrder = async (address) => {
    setPlacing(true);
    try {
      await api.createOrder({
        restaurantId: id,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        deliveryAddress: address,
      });
      clearCart();
      setCartOpen(false);
      Alert.alert('Order placed! 🎉', 'Your order is on its way.', [
        { text: 'OK', onPress: () => router.push('/(tabs)/orders') },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={C.blue} />
      </View>
    );
  }

  const qtyOf = (productId) => {
    const found = items.find(i => i.productId === productId);
    return found ? found.quantity : 0;
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.blue} />

      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={s.topTitle} numberOfLines={1}>{restaurant?.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* ── Hero header ── */}
      <View style={s.hero}>
        <View style={s.heroEmoji}>
          <Text style={{ fontSize: 52 }}>🍽️</Text>
        </View>
        <Text style={s.heroName}>{restaurant?.name}</Text>
        {restaurant?.cuisineType ? (
          <Text style={s.heroSub}>{restaurant.cuisineType}</Text>
        ) : null}
        <View style={s.heroPills}>
          {restaurant?.openingHours ? (
            <View style={s.pill}>
              <Text style={s.pillTxt}>🕐 {restaurant.openingHours}</Text>
            </View>
          ) : null}
          {restaurant?.address ? (
            <View style={s.pill}>
              <Text style={s.pillTxt}>📍 {restaurant.address}</Text>
            </View>
          ) : null}
          {restaurant?.phone ? (
            <View style={s.pill}>
              <Text style={s.pillTxt}>📞 {restaurant.phone}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* ── Divider ── */}
      <View style={s.menuLabel}>
        <Text style={s.menuLabelTxt}>Menu</Text>
      </View>

      {/* ── Product list ── */}
      <FlatList
        data={products}
        keyExtractor={i => i.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <Text style={s.empty}>No dishes available yet</Text>
        }
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            qty={qtyOf(item.id)}
            onAdd={() => handleAdd(item)}
            onDecrement={() => decrementItem(item.id)}
          />
        )}
      />

      {/* ── Sticky cart bar ── */}
      {cartCount > 0 && (
        <TouchableOpacity style={s.cartBar} onPress={() => setCartOpen(true)} activeOpacity={0.9}>
          <View style={s.cartBadge}>
            <Text style={s.cartBadgeTxt}>{cartCount}</Text>
          </View>
          <Text style={s.cartBarTxt}>View cart</Text>
          <Text style={s.cartBarTotal}>₪{total.toFixed(2)}</Text>
        </TouchableOpacity>
      )}

      {/* ── Cart modal ── */}
      <CartModal
        visible={cartOpen}
        items={items}
        total={total}
        onClose={() => setCartOpen(false)}
        onClear={() => { clearCart(); setCartOpen(false); }}
        onDecrement={decrementItem}
        onAdd={handleAddFromCart}
        onPlace={placeOrder}
        placing={placing}
      />
    </SafeAreaView>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: C.bg },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // top bar
  topBar:        { backgroundColor: C.blue, flexDirection: 'row', alignItems: 'center',
                   paddingHorizontal: 12, paddingVertical: 10 },
  backBtn:       { width: 36, height: 36, justifyContent: 'center' },
  backTxt:       { color: C.white, fontSize: 24, fontWeight: '700' },
  topTitle:      { flex: 1, color: C.white, fontSize: 17, fontWeight: '700', textAlign: 'center' },

  // hero
  hero:          { backgroundColor: C.white, alignItems: 'center', paddingVertical: 20,
                   paddingHorizontal: 16, borderBottomWidth: 1, borderColor: C.border },
  heroEmoji:     { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F4FB',
                   justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  heroName:      { fontSize: 22, fontWeight: '800', color: C.text, textAlign: 'center' },
  heroSub:       { color: C.sub, fontSize: 14, marginTop: 4, textAlign: 'center' },
  heroPills:     { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
                   gap: 6, marginTop: 10 },
  pill:          { backgroundColor: C.bg, borderRadius: 20, paddingHorizontal: 10,
                   paddingVertical: 4, borderWidth: 1, borderColor: C.border },
  pillTxt:       { fontSize: 12, color: C.sub },

  // section label
  menuLabel:     { paddingHorizontal: 16, paddingVertical: 10 },
  menuLabelTxt:  { fontSize: 17, fontWeight: '700', color: C.text },

  // list
  list:          { paddingHorizontal: 14, paddingBottom: 100 },
  empty:         { textAlign: 'center', color: C.sub, marginTop: 60, fontSize: 15 },

  // product card
  card:          { backgroundColor: C.white, borderRadius: 14, padding: 14, marginBottom: 10,
                   flexDirection: 'row', alignItems: 'center',
                   elevation: 2, shadowColor: '#000', shadowOpacity: 0.06,
                   shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  cardLeft:      { flex: 1, marginRight: 12 },
  pName:         { fontSize: 15, fontWeight: '700', color: C.text },
  pDesc:         { color: C.sub, fontSize: 12, marginTop: 3, lineHeight: 17 },
  catPill:       { alignSelf: 'flex-start', backgroundColor: '#E8F4FB', borderRadius: 10,
                   paddingHorizontal: 8, paddingVertical: 2, marginTop: 5 },
  catTxt:        { color: C.blue, fontSize: 11, fontWeight: '600' },
  pPrice:        { fontSize: 15, fontWeight: '700', color: C.blue, marginTop: 7 },

  // qty controls on card
  qtyCol:        { alignItems: 'center' },
  qtyRow:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn:        { backgroundColor: C.blue, width: 30, height: 30, borderRadius: 15,
                   justifyContent: 'center', alignItems: 'center' },
  qtyBtnTxt:     { color: C.white, fontSize: 20, lineHeight: 28, fontWeight: '700' },
  qtyNum:        { fontSize: 15, fontWeight: '700', color: C.text, minWidth: 22, textAlign: 'center' },
  addBtn:        { backgroundColor: C.blue, width: 36, height: 36, borderRadius: 18,
                   justifyContent: 'center', alignItems: 'center' },
  addTxt:        { color: C.white, fontSize: 26, lineHeight: 34, fontWeight: '700' },

  // sticky cart bar
  cartBar:       { position: 'absolute', bottom: 0, left: 0, right: 0,
                   backgroundColor: C.blue, flexDirection: 'row', alignItems: 'center',
                   paddingHorizontal: 20, paddingVertical: 14,
                   paddingBottom: Platform.OS === 'ios' ? 28 : 14,
                   elevation: 10, shadowColor: '#000', shadowOpacity: 0.2,
                   shadowRadius: 8, shadowOffset: { width: 0, height: -2 } },
  cartBadge:     { backgroundColor: 'rgba(255,255,255,0.3)', width: 28, height: 28,
                   borderRadius: 14, justifyContent: 'center', alignItems: 'center',
                   marginRight: 12 },
  cartBadgeTxt:  { color: C.white, fontWeight: '800', fontSize: 13 },
  cartBarTxt:    { flex: 1, color: C.white, fontWeight: '700', fontSize: 16 },
  cartBarTotal:  { color: C.white, fontWeight: '800', fontSize: 16 },
});

/* ─── Cart modal styles ──────────────────────────────────────────────── */
const cm = StyleSheet.create({
  root:       { flex: 1, backgroundColor: C.white },
  bar:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                padding: 16, borderBottomWidth: 1, borderColor: C.border },
  close:      { fontSize: 18, color: C.sub, padding: 4 },
  title:      { fontSize: 18, fontWeight: '700', color: C.text },
  clearTxt:   { color: C.red, fontWeight: '600', fontSize: 15 },

  body:       { flex: 1, paddingHorizontal: 16, paddingTop: 8 },

  item:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg,
                borderRadius: 12, padding: 12, marginBottom: 8 },
  itemLeft:   { flex: 1, marginRight: 12 },
  iName:      { fontSize: 14, fontWeight: '600', color: C.text },
  iPrice:     { color: C.blue, fontWeight: '700', fontSize: 13, marginTop: 3 },

  qtyRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qBtn:       { backgroundColor: C.blue, width: 28, height: 28, borderRadius: 14,
                justifyContent: 'center', alignItems: 'center' },
  qBtnTxt:    { color: C.white, fontSize: 18, lineHeight: 26, fontWeight: '700' },
  qNum:       { fontSize: 15, fontWeight: '700', color: C.text, minWidth: 20, textAlign: 'center' },

  addrBlock:  { marginTop: 16, backgroundColor: C.bg, borderRadius: 12, padding: 14 },
  addrLabel:  { fontSize: 13, fontWeight: '600', color: C.sub, marginBottom: 8 },
  addrInput:  { borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12,
                fontSize: 15, color: C.text, backgroundColor: C.white },

  footer:     { padding: 20, borderTopWidth: 1, borderColor: C.border, backgroundColor: C.white },
  totalRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 14 },
  totalLabel: { fontSize: 16, color: C.sub, fontWeight: '600' },
  totalVal:   { fontSize: 20, fontWeight: '800', color: C.text },
  orderBtn:   { backgroundColor: C.blue, borderRadius: 14, padding: 16, alignItems: 'center' },
  orderTxt:   { color: C.white, fontWeight: '700', fontSize: 16 },
});
