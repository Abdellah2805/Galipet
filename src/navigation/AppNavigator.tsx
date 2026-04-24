import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSupabase } from '../lib/supabase';
import { colors, radius, spacing } from '../theme/colors';
import ProfileScreen from '../screens/ProfileScreen';

const SERVICE_CATEGORIES = [
  { id: '1', title: 'Santé', subtitle: 'Vétérinaires & urgences', icon: 'medical', color: '#D4663A', bg: '#F5E6E0', route: '/services/sante' },
  { id: '2', title: 'Toilettage', subtitle: 'Beauté & bien-être', icon: 'cut', color: '#5B8C6F', bg: '#E8F0ED', route: '/services/toilettage' },
  { id: '3', title: 'Pet-sitting', subtitle: 'Garde & promenades', icon: 'home', color: '#E8A87C', bg: '#FDF3ED', route: '/services/petsitting' },
  { id: '4', title: 'Éducation', subtitle: 'Dressage & comportement', icon: 'school', color: '#C9B037', bg: '#FBF7E4', route: '/services/education' },
  { id: '5', title: 'Accessoires', subtitle: 'Bientôt disponible', icon: 'tennisball', color: '#A0A0A0', bg: '#F0F0F0', disabled: true, route: '/services/accessoires' },
  { id: '6', title: 'Nutrition', subtitle: 'Bientôt disponible', icon: 'restaurant', color: '#A0A0A0', bg: '#F0F0F0', disabled: true, route: '/services/nutrition' },
];

const RECOMMENDED = [
  {
    id: '1',
    title: 'Le promeneur en rollers',
    subtitle: 'Promenades ludiques en roller',
    rating: 4.0,
    image: 'https://images.unsplash.com/photo-1601758224511-32e8adefbc4e?w=400',
    reviews: 28,
  },
  {
    id: '2',
    title: 'Les pits à plumes',
    subtitle: 'Conseil oiseau exotique',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
    reviews: 15,
  },
];

const BLOG_POSTS = [
  {
    id: '1',
    title: 'Conseils alimentaires hiver',
    category: 'Nutrition',
    readTime: '5 min',
    date: '15 Jan',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
  },
  {
    id: '2',
    title: 'Changer la litière',
    category: 'Hygiène',
    readTime: '3 min',
    date: '10 Jan',
    image: 'https://images.unsplash.com/photo-1573865526739-10659f9f4a77?w=400',
  },
];

const TabBar = ({ currentTab, setCurrentTab }: { currentTab: string; setCurrentTab: (tab: any) => void }) => (
  <View style={styles.tabBar}>
    <TouchableOpacity 
      style={[styles.tabItem, currentTab === 'explore' && styles.tabItemActive]} 
      onPress={() => setCurrentTab('explore')}
      activeOpacity={0.7}
    >
      <Ionicons name="search" size={22} color={currentTab === 'explore' ? '#E87A5D' : '#6B6660'} />
      <Text style={[styles.tabLabel, currentTab === 'explore' && styles.tabLabelActive]}>Explorer</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={[styles.tabItem, currentTab === 'animals' && styles.tabItemActive]} 
      onPress={() => setCurrentTab('animals')}
      activeOpacity={0.7}
    >
      <Ionicons name="heart" size={22} color={currentTab === 'animals' ? '#E87A5D' : '#6B6660'} />
      <Text style={[styles.tabLabel, currentTab === 'animals' && styles.tabLabelActive]}>Mes Animaux</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={[styles.tabItem, currentTab === 'messages' && styles.tabItemActive]} 
      onPress={() => setCurrentTab('messages')}
      activeOpacity={0.7}
    >
      <Ionicons name="chatbubble" size={22} color={currentTab === 'messages' ? '#E87A5D' : '#6B6660'} />
      <Text style={[styles.tabLabel, currentTab === 'messages' && styles.tabLabelActive]}>Messages</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={[styles.tabItem, currentTab === 'profile' && styles.tabItemActive]} 
      onPress={() => setCurrentTab('profile')}
      activeOpacity={0.7}
    >
      <Ionicons name="person" size={22} color={currentTab === 'profile' ? '#E87A5D' : '#6B6660'} />
      <Text style={[styles.tabLabel, currentTab === 'profile' && styles.tabLabelActive]}>Profil</Text>
    </TouchableOpacity>
  </View>
);

const ServiceCard = ({ item, onPress }: { item: typeof SERVICE_CATEGORIES[0]; onPress: () => void }) => (
  <TouchableOpacity 
    style={[styles.categoryCard, { backgroundColor: item.bg }, item.disabled && styles.categoryDisabled]} 
    onPress={onPress}
    disabled={item.disabled}
    activeOpacity={0.8}
  >
    <View style={[styles.categoryIconContainer, { backgroundColor: item.color + '20' }]}>
      <Ionicons name={item.icon as any} size={28} color={item.color} />
    </View>
    <Text style={[styles.categoryTitle, { color: item.color }]}>{item.title}</Text>
    <Text style={styles.categorySubtitle}>{item.subtitle}</Text>
  </TouchableOpacity>
);

export default function AppNavigator() {
  const [viewMode, setViewMode] = useState('grid');
  const [currentTab, setCurrentTab] = useState('explore' as 'explore' | 'animals' | 'messages' | 'profile');
  const supabase = getSupabase();

  const handleServicePress = (route: string) => {
    console.log('Navigate to:', route);
  };

  const handleHeaderIconPress = (screen: string) => {
    if (screen === 'profile') {
      setCurrentTab('profile');
    } else if (screen === 'messages') {
      setCurrentTab('messages');
    }
    console.log('Navigate to:', screen);
  };

  const renderRecommended = ({ item }: { item: typeof RECOMMENDED[0] }) => (
    <View style={styles.recommendedCard}>
      <Image source={{ uri: item.image }} style={styles.recommendedImage} />
      <View style={styles.recommendedContent}>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
        </View>
        <Text style={styles.recommendedTitle}>{item.title}</Text>
        <Text style={styles.recommendedSubtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  const renderBlog = ({ item }: { item: typeof BLOG_POSTS[0] }) => (
    <View style={styles.blogCard}>
      <Image source={{ uri: item.image }} style={styles.blogImage} />
      <View style={styles.blogContent}>
        <View style={styles.blogBadge}>
          <Text style={styles.blogBadgeText}>{item.category}</Text>
        </View>
        <Text style={styles.blogTitle}>{item.title}</Text>
        <Text style={styles.blogMeta}>{item.readTime} • {item.date}</Text>
      </View>
    </View>
  );

  if (currentTab === 'profile') {
    return (
      <View style={styles.container}>
        <ProfileScreen navigation={{ navigate: (screen: any) => setCurrentTab(screen) }} onNavigate={setCurrentTab} />
        <TabBar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </View>
    );
  }

  if (currentTab === 'animals') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => setCurrentTab('profile')} activeOpacity={0.7}>
            <Ionicons name="person" size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerLogo}>gali<Text style={styles.headerLogoAccent}>'</Text>pet</Text>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity onPress={() => handleHeaderIconPress('messages')} activeOpacity={0.7}>
              <Ionicons name="chatbubble-ellipses" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('calendar')} activeOpacity={0.7}>
              <Ionicons name="calendar" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('notifications')} activeOpacity={0.7}>
              <Ionicons name="notifications" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="paw" size={48} color="#6B6660" />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#2E2A26', marginTop: 12 }}>Mes Animaux</Text>
          <Text style={{ fontSize: 14, color: '#6B6660', marginTop: 8 }}>Ajoutez votre premier animal</Text>
        </View>
        <TabBar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </View>
    );
  }

  if (currentTab === 'messages') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => setCurrentTab('profile')} activeOpacity={0.7}>
            <Ionicons name="person" size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerLogo}>gali<Text style={styles.headerLogoAccent}>'</Text>pet</Text>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity onPress={() => handleHeaderIconPress('messages')} activeOpacity={0.7}>
              <Ionicons name="chatbubble-ellipses" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('calendar')} activeOpacity={0.7}>
              <Ionicons name="calendar" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('notifications')} activeOpacity={0.7}>
              <Ionicons name="notifications" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="chatbubble-ellipses-outline" size={48} color="#6B6660" />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#2E2A26', marginTop: 12 }}>Messages</Text>
          <Text style={{ fontSize: 14, color: '#6B6660', marginTop: 8 }}>Vos conversations</Text>
        </View>
        <TabBar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => setCurrentTab('profile')} activeOpacity={0.7}>
            <Ionicons name="person" size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerLogo}>gali<Text style={styles.headerLogoAccent}>'</Text>pet</Text>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity onPress={() => handleHeaderIconPress('messages')} activeOpacity={0.7}>
              <Ionicons name="chatbubble-ellipses" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('calendar')} activeOpacity={0.7}>
              <Ionicons name="calendar" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('notifications')} activeOpacity={0.7}>
              <Ionicons name="notifications" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SALUTATION */}
        <View style={styles.salutation}>
          <Text style={styles.salutationText}>Bonjour jean !</Text>
          <Text style={styles.salutationSubtext}>Que cherchez-vous aujourd'hui ?</Text>
        </View>

        {/* VILLE SELECTOR */}
        <TouchableOpacity style={styles.citySelector} activeOpacity={0.7}>
          <Ionicons name="location" size={16} color="#E87A5D" />
          <Text style={styles.cityText}>Paris</Text>
          <Ionicons name="chevron-down" size={12} color="#E87A5D" />
        </TouchableOpacity>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#999" />
            <TextInput style={styles.searchInput} placeholder="Rechercher des services, prestataires." placeholderTextColor="#999" />
          </View>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
            <Ionicons name="options" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* VIEW TOGGLE */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]} onPress={() => setViewMode('grid')} activeOpacity={0.7}>
            <Ionicons name="grid" size={18} color={viewMode === 'grid' ? '#FFF' : '#2E2A26'} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]} onPress={() => setViewMode('map')} activeOpacity={0.7}>
            <Ionicons name="map" size={18} color={viewMode === 'map' ? '#FFF' : '#2E2A26'} />
          </TouchableOpacity>
        </View>

        {/* SERVICES GRID */}
        <Text style={styles.sectionTitle}>Services</Text>
        <View style={styles.gridContainer}>
          {SERVICE_CATEGORIES.map((item) => (
            <ServiceCard key={item.id} item={item} onPress={() => handleServicePress(item.route)} />
          ))}
        </View>

        {/* MAP VIEW */}
        {viewMode === 'map' && (
          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map" size={40} color="#6B6660" />
              <Text style={styles.mapPlaceholderLabel}>Carte interactive</Text>
            </View>
            <View style={styles.mapFilters}>
              <TouchableOpacity style={styles.mapFilterBtnActive}><Text style={styles.mapFilterText}>Tous</Text></TouchableOpacity>
              <TouchableOpacity style={styles.mapFilterBtn}><Text style={styles.mapFilterTextDark}>Santé</Text></TouchableOpacity>
              <TouchableOpacity style={styles.mapFilterBtn}><Text style={styles.mapFilterTextDark}>Toilettage</Text></TouchableOpacity>
            </View>
          </View>
        )}

        {/* RECOMMENDED SECTION */}
        <Text style={styles.sectionTitle}>Recommandé pour vous</Text>
        <FlatList
          data={RECOMMENDED}
          renderItem={renderRecommended}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />

        {/* BLOG SECTION */}
        <Text style={styles.sectionTitle}>À découvrir</Text>
        <FlatList
          data={BLOG_POSTS}
          renderItem={renderBlog}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* BOTTOM TAB BAR */}
      <TabBar currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F1' },
  
  // HEADER
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#E87A5D', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16,
  },
  headerIconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  headerIcon: { fontSize: 20 },
  headerLogo: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  headerLogoAccent: { color: '#FFF' },
  headerRightIcons: { flexDirection: 'row', gap: 16 },
  
  // SALUTATION
  salutation: { paddingHorizontal: 16, paddingTop: 20 },
  salutationText: { fontSize: 26, fontWeight: '700', color: '#2E2A26' },
  salutationSubtext: { fontSize: 16, color: '#6B6660', marginTop: 4 },
  
  // CITY SELECTOR
  citySelector: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  cityIcon: { fontSize: 16 },
  cityText: { fontSize: 16, fontWeight: '600', color: '#E87A5D' },
  cityArrow: { fontSize: 10, color: '#E87A5D' },
  
  // SEARCH
  searchContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 25, paddingHorizontal: 16, borderWidth: 1, borderColor: '#EADBC8' },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#2E2A26', marginLeft: 8 },
  filterBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E87A5D', alignItems: 'center', justifyContent: 'center' },
  filterBtnText: { fontSize: 20 },
  
  // TOGGLE
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 16, gap: 12 },
  toggleBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EADBC8' },
  toggleBtnActive: { backgroundColor: '#E87A5D', borderColor: '#E87A5D' },
  toggleIcon: { fontSize: 18 },
  
  // SECTIONS
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2E2A26', paddingHorizontal: 16, marginTop: 20, marginBottom: 12 },
  
  // GRID
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  categoryCard: { width: '48%', borderRadius: 16, padding: 16, alignItems: 'center' },
  categoryDisabled: { opacity: 0.5 },
  categoryIconContainer: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  categoryIcon: { fontSize: 28, marginBottom: 8 },
  categoryTitle: { fontSize: 16, fontWeight: '700' },
  categorySubtitle: { fontSize: 11, color: '#6B6660', marginTop: 4, textAlign: 'center' },
  
  // MAP
  mapContainer: { paddingHorizontal: 16, gap: 10 },
  mapPlaceholder: { height: 180, backgroundColor: '#E8F0ED', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  mapPlaceholderText: { fontSize: 40 },
  mapPlaceholderLabel: { fontSize: 14, color: '#6B6660', marginTop: 8 },
  mapFilters: { flexDirection: 'row', gap: 8 },
  mapFilterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EADBC8' },
  mapFilterBtnActive: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E87A5D' },
  mapFilterText: { color: '#FFF', fontWeight: '600' },
  mapFilterTextDark: { color: '#2E2A26', fontWeight: '600' },
  
  // HORIZONTAL LISTS
  horizontalList: { paddingHorizontal: 16 },
  
  // RECOMMENDED
  recommendedCard: { width: 200, marginRight: 12 },
  recommendedImage: { width: '100%', height: 120, borderRadius: 16, backgroundColor: '#EADBC8' },
  recommendedContent: { paddingVertical: 8 },
  ratingBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#FFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  ratingText: { fontSize: 12, fontWeight: '600' },
  recommendedTitle: { fontSize: 14, fontWeight: '700', color: '#2E2A26', marginTop: 4 },
  recommendedSubtitle: { fontSize: 12, color: '#6B6660' },
  
  // BLOG
  blogCard: { width: 160, marginRight: 12 },
  blogImage: { width: '100%', height: 100, borderRadius: 16, backgroundColor: '#EADBC8' },
  blogContent: { paddingVertical: 8 },
  blogBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#7BA988', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  blogBadgeText: { fontSize: 10, color: '#FFF', fontWeight: '600' },
  blogTitle: { fontSize: 14, fontWeight: '600', color: '#2E2A26', marginTop: 8 },
  blogMeta: { fontSize: 11, color: '#6B6660', marginTop: 4 },
  
  bottomSpacer: { height: 100 },
  
  // TAB BAR
  tabBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', backgroundColor: '#FFF', paddingBottom: 30, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#EADBC8',
    alignItems: 'center', justifyContent: 'space-evenly',
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 8,
  },
  tabItem: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  tabItemActive: { backgroundColor: '#FFF5F0' },
  tabIcon: { fontSize: 22, color: '#6B6660' },
  tabIconActive: { fontSize: 22, color: '#E87A5D' },
  tabLabel: { fontSize: 10, color: '#6B6660', marginTop: 4, textAlign: 'center' },
  tabLabelActive: { color: '#E87A5D', fontWeight: '600' },
  tabLogo: { alignItems: 'center', justifyContent: 'center' },
  tabLogoCircle: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#E87A5D',
    alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFF',
    shadowColor: '#E87A5D', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
  },
  tabLogoText: { fontSize: 20, fontWeight: '800', color: '#FFF' },
});