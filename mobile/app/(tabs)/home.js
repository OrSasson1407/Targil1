import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, RefreshControl, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../src/api';
import { C } from '../../src/components/colors';

function RestaurantCard({ item, onPress }) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      <View style={s.cardImg}>
        <Text style={s.cardEmoji}>🍽️</Text>
      </View>
      <View style={s.cardBody}>
        <Text style={s.cardName}>{item.name}</Text>
        <Text style={s.cardSub}>{item.cuisineType || 'Restaurant'}</Text>
        {item.openingHours ? <Text style={s.cardHours}>🕐 {item.openingHours}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState([]);
  const [query, setQuery]             = useState('');
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.getRestaurants();
      setRestaurants(data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = query.trim()
    ? restaurants.filter(r =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        (r.cuisineType || '').toLowerCase().includes(query.toLowerCase()))
    : restaurants;

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={C.blue}/></View>;

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Wolt</Text>
      </View>
      <View style={s.searchBox}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search restaurants or cuisine..."
          placeholderTextColor={C.sub}
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[C.blue]}/>}
        ListEmptyComponent={<Text style={s.empty}>No restaurants found</Text>}
        renderItem={({ item }) => (
          <RestaurantCard item={item} onPress={() => router.push('/restaurant/' + item.id)} />
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:      { backgroundColor: C.blue, paddingVertical: 16, paddingHorizontal: 20 },
  headerTitle: { color: C.white, fontSize: 24, fontWeight: '900' },
  searchBox:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, margin: 14, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: C.border, elevation: 2 },
  searchIcon:  { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 15, color: C.text },
  list:        { paddingHorizontal: 14, paddingBottom: 24 },
  empty:       { textAlign: 'center', color: C.sub, marginTop: 60, fontSize: 16 },
  card:        { backgroundColor: C.white, borderRadius: 16, marginBottom: 14, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  cardImg:     { backgroundColor: '#E8F4FB', height: 110, justifyContent: 'center', alignItems: 'center' },
  cardEmoji:   { fontSize: 48 },
  cardBody:    { padding: 14 },
  cardName:    { fontSize: 17, fontWeight: '700', color: C.text },
  cardSub:     { color: C.sub, fontSize: 13, marginTop: 3 },
  cardHours:   { color: C.sub, fontSize: 12, marginTop: 4 },
});