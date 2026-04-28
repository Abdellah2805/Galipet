import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, FlatList, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import Icon from '../components/Icon';
import { getSupabase } from '../lib/supabase';
import { colors, radius, spacing } from '../theme/colors';
import ProfileScreen from '../screens/ProfileScreen';
import PetProfileScreen from '../screens/PetProfileScreen';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { useUserPets } from '../hooks/useSupabase';

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
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUSj6OVcnF0IJeJVmBaVFofnUfRJk3xa81gQ&s',
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
    image: 'https://www.consoglobe.com/wp-content/uploads/2022/11/litiere-chat-ecologique-economique-shutterstock_2027517470-1200x628.jpg',
  },
];

const TabBar = ({ currentTab, setCurrentTab }: { currentTab: string; setCurrentTab: (tab: any) => void }) => (
  <View style={styles.tabBar}>
    <TouchableOpacity
      style={[styles.tabItem, currentTab === 'explore' && styles.tabItemActive]}
      onPress={() => setCurrentTab('explore')}
      activeOpacity={0.7}
    >
      <Icon name="search" size={22} color={currentTab === 'explore' ? '#E87A5D' : '#6B6660'} />
      <Text style={[styles.tabLabel, currentTab === 'explore' && styles.tabLabelActive]}>Explorer</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.tabItem, currentTab === 'animals' && styles.tabItemActive]}
      onPress={() => setCurrentTab('animals')}
      activeOpacity={0.7}
    >
      <Icon name="heart" size={22} color={currentTab === 'animals' ? '#E87A5D' : '#6B6660'} />
      <Text style={[styles.tabLabel, currentTab === 'animals' && styles.tabLabelActive]}>Mes Animaux</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.tabItem, currentTab === 'messages' && styles.tabItemActive]}
      onPress={() => setCurrentTab('messages')}
      activeOpacity={0.7}
    >
      <Icon name="chatbubble" size={22} color={currentTab === 'messages' ? '#E87A5D' : '#6B6660'} />
      <Text style={[styles.tabLabel, currentTab === 'messages' && styles.tabLabelActive]}>Messages</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.tabItem, currentTab === 'profile' && styles.tabItemActive]}
      onPress={() => setCurrentTab('profile')}
      activeOpacity={0.7}
    >
      <Icon name="person" size={22} color={currentTab === 'profile' ? '#E87A5D' : '#6B6660'} />
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
      <Icon name={item.icon as any} size={28} color={item.color} />
    </View>
    <Text style={[styles.categoryTitle, { color: item.color }]}>{item.title}</Text>
    <Text style={styles.categorySubtitle}>{item.subtitle}</Text>
  </TouchableOpacity>
);

export default function AppNavigator() {
  const [viewMode, setViewMode] = useState('grid');
  const [currentTab, setCurrentTab] = useState('explore' as 'explore' | 'animals' | 'messages' | 'profile' | 'petProfile');
  const [isAddAnimalModalVisible, setAddAnimalModalVisible] = useState(false);

  // Restore active tab from localStorage on mount (prevents landing on 'explore' after every F5)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('galipet_current_tab');
      if (saved && ['explore', 'animals', 'messages', 'profile', 'petProfile'].includes(saved)) {
        setCurrentTab(saved as any);
      }
    }
  }, []);

  // Persist active tab whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('galipet_current_tab', currentTab);
    }
  }, [currentTab]);
const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
const [formStep, setFormStep] = useState(1);
const [currentAnimal, setCurrentAnimal] = useState<any>(null);
const [animalPhoto, setAnimalPhoto] = useState<string | null>(null);
const [animalNom, setAnimalNom] = useState('');
const [animalRace, setAnimalRace] = useState('');
const [animalDateNaissance, setAnimalDateNaissance] = useState<Date | null>(null);
const [showDatePicker, setShowDatePicker] = useState(false);
const [animalSexe, setAnimalSexe] = useState('');
const [animalTaille, setAnimalTaille] = useState('');
const [animalTypePoil, setAnimalTypePoil] = useState('');
const [animalDescription, setAnimalDescription] = useState('');
const [animalPoids, setAnimalPoids] = useState('');
const [animalAllergies, setAnimalAllergies] = useState('');
const [animalVaccinations, setAnimalVaccinations] = useState('');
  const [selectedPersonalityTags, setSelectedPersonalityTags] = useState<string[]>([]);
  const [firstName, setFirstName] = useState('');
  const [isCreatingPet, setIsCreatingPet] = useState(false);
  const supabase = getSupabase();
  const { session, loading: authLoading } = useAuth();

  const { data: userPets, isLoading: isLoadingPets, mutate: mutatePets } = useUserPets(session?.user?.id);

  // Block render while auth is still rehydrating to avoid showing empty states
  if (authLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9F1', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#E87A5D" />
      </SafeAreaView>
    );
  }

  // If user landed on petProfile but currentAnimal was lost (e.g. after F5), redirect to animals list
  useEffect(() => {
    if (currentTab === 'petProfile' && !currentAnimal) {
      setCurrentTab('animals');
    }
  }, [currentTab, currentAnimal]);

const personalityTags = ['Joueur', 'Calme', 'Affectueux', 'Énergique', 'Câlin', 'Indépendant', 'Sociable', 'Curieux', 'Gourmand', 'Protecteur'];

const resetAnimalForm = () => {
  setFormStep(1);
  setSelectedSpecies(null);
  setAnimalPhoto(null);
  setAnimalNom('');
  setAnimalRace('');
  setAnimalDateNaissance(null);
  setShowDatePicker(false);
  setAnimalSexe('');
  setAnimalTaille('');
  setAnimalTypePoil('');
  setAnimalDescription('');
  setAnimalPoids('');
  setAnimalAllergies('');
  setAnimalVaccinations('');
  setSelectedPersonalityTags([]);
};

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

   if (!result.canceled) {
    setAnimalPhoto(result.assets[0].uri);
  }
};

useEffect(() => {
  if (session?.user) {
    loadUserName();
  }
}, [session]);

const loadUserName = async () => {
  try {
    const { data } = await supabase
      .from('customer_profiles')
      .select('full_name')
      .eq('id', session.user.id)
      .maybeSingle();

    if (data?.full_name) {
      const name = data.full_name.split(' ')[0];
      setFirstName(name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
    }
  } catch (error) {
    console.error('Error loading user name:', error);
  }
};

  const handleCreatePet = async () => {
    try {
      setIsCreatingPet(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('Erreur', 'Vous devez être connecté pour ajouter un animal');
        return;
      }

      if (!animalNom || !selectedSpecies) {
        Alert.alert('Erreur', 'Veuillez remplir au moins le nom et l\'espèce');
        return;
      }

      let profileImageUrl = null;
      // Temporairement désactivé pour tester sans upload
      /*
      if (animalPhoto) {
        const fileName = `${user.id}_${Date.now()}.jpg`;
        const response = await fetch(animalPhoto);
        const blob = await response.blob();
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('pet-photos')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: false,
          });
        if (uploadError) {
          console.error('Upload error', uploadError);
          Alert.alert('Erreur', 'Erreur lors de l\'upload de l\'image');
          return;
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('pet-photos')
            .getPublicUrl(fileName);
          profileImageUrl = publicUrl;
        }
      }
      */

      const allergies = animalAllergies ? animalAllergies.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
      const vaccinations = animalVaccinations ? animalVaccinations.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
      const personalityTraits = selectedPersonalityTags;

      const { data: petData, error: insertError } = await supabase
        .from('pets')
        .insert([
          {
            owner_id: user.id,
            name: animalNom,
            species: selectedSpecies,
            breed: animalRace || null,
            birth_date: animalDateNaissance ? animalDateNaissance.toISOString().split('T')[0] : null,
            gender: animalSexe || null,
            size: animalTaille || null,
            coat_type: animalTypePoil || null,
            description: animalDescription || null,
            weight_kg: animalPoids ? parseFloat(animalPoids) : null,
            profile_image_url: profileImageUrl,
            allergies: allergies,
            vaccinations: vaccinations,
            personality_traits: personalityTraits,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Insert error', insertError);
        Alert.alert('Erreur', 'Erreur lors de l\'enregistrement de l\'animal');
        return;
      }

      Alert.alert('Succès', 'Animal ajouté avec succès !');

      setCurrentAnimal(petData);
      resetAnimalForm();
      setAddAnimalModalVisible(false);
      await mutatePets(); // Recharge la liste des animaux
      setCurrentTab('petProfile');
    } catch (error) {
      console.error('Error creating pet', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsCreatingPet(false);
    }
  };

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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9F1' }}>
        <ProfileScreen navigation={{ navigate: (screen: any) => setCurrentTab(screen) }} onNavigate={setCurrentTab} />
        <TabBar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </SafeAreaView>
    );
  }

  if (currentTab === 'animals') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9F1' }}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => setCurrentTab('profile')} activeOpacity={0.7}>
            <Icon name="person" size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerLogo}>gali<Text style={styles.headerLogoAccent}>'</Text>pet</Text>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity onPress={() => handleHeaderIconPress('messages')} activeOpacity={0.7}>
              <Icon name="chatbubble-ellipses" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('calendar')} activeOpacity={0.7}>
              <Icon name="calendar" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('notifications')} activeOpacity={0.7}>
              <Icon name="notifications" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* TITRE + BOUTON AJOUTER */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#2E2A26' }}>Mes Animaux</Text>
          <TouchableOpacity
            onPress={() => setAddAnimalModalVisible(true)}
            style={{ backgroundColor: '#FF5722', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>+ Ajouter</Text>
          </TouchableOpacity>
        </View>

        {/* LISTE DES ANIMAUX (FlatList avec paddingBottom) */}
        <View style={{ flex: 1 }}>
          {isLoadingPets ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <ActivityIndicator size="large" color="#FF5722" />
            </View>
          ) : (userPets || []).length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF5F0', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="paw" size={50} color="#FF5722" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#2E2A26', marginTop: 20 }}>Aucun animal enregistré</Text>
              <Text style={{ fontSize: 14, color: '#6B6660', marginTop: 8, textAlign: 'center' }}>Ajoutez votre premier compagnon pour profiter de tous nos services</Text>
              <TouchableOpacity
                style={{ marginTop: 24, backgroundColor: '#FF5722', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 25, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                onPress={() => setAddAnimalModalVisible(true)}
                activeOpacity={0.8}
              >
                <Icon name="add" size={22} color="#FFF" />
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>+ Ajouter un animal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={userPets || []}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setCurrentAnimal(item);
                    setCurrentTab('petProfile');
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#EADBC8' }}
                >
                  <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF8F1', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#EADBC8' }}>
                    {item.profile_image_url ? (
                      <Image source={{ uri: item.profile_image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <Icon name="paw" size={24} color="#FF5722" />
                    )}
                  </View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#2E2A26' }}>{item.name}</Text>
                    <Text style={{ fontSize: 14, color: '#6B6660' }}>{item.species === 'chien' ? 'Chien' : 'Chat'}</Text>
                    {item.breed && <Text style={{ fontSize: 12, color: '#6B6660' }}>{item.breed}</Text>}
                  </View>
                  <Icon name="chevron-forward" size={20} color="#6B6660" />
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <TabBar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* MODAL AJOUT ANIMAL */}
        <Modal
          visible={isAddAnimalModalVisible}
          animationType="slide"
          onRequestClose={() => { resetAnimalForm(); setAddAnimalModalVisible(false); }}
        >
          {formStep === 1 ? (
            <View style={{ flex: 1, backgroundColor: '#FFF8F1' }}>
              <View style={{ backgroundColor: '#FF5722', height: '33%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="paw" size={40} color="#FF5722" />
                </View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF', marginTop: 12 }}>Anim'All</Text>
                <Text style={{ fontSize: 14, color: '#FFF', marginTop: 4 }}>Ajoutez un nouveau compagnon</Text>
              </View>

              <View style={{ flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, padding: 24, alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#2E2A26', textAlign: 'center' }}>Quelle est l'espèce de votre GaliPet ?</Text>
                <Text style={{ fontSize: 14, color: '#6B6660', textAlign: 'center', marginTop: 8 }}>Sélectionnez pour commencer la création du profil</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 30 }}>
                  <TouchableOpacity
                    style={{ width: '48%', aspectRatio: 1, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#EADBC8', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { setSelectedSpecies('chien'); setFormStep(2); }}
                    activeOpacity={0.8}
                  >
                    <View style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#FF5722', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="logo-octocat" size={30} color="#FF5722" />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#2E2A26', marginTop: 12 }}>Chien</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ width: '48%', aspectRatio: 1, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#EADBC8', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { setSelectedSpecies('chat'); setFormStep(2); }}
                    activeOpacity={0.8}
                  >
                    <View style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#FF5722', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="logo-octocat" size={30} color="#FF5722" />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#2E2A26', marginTop: 12 }}>Chat</Text>
                  </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 12, color: '#6B6660', textAlign: 'center', marginTop: 30, paddingHorizontal: 20 }}>Vous pourrez ajouter tous les détails dans l'étape suivante</Text>

                <TouchableOpacity onPress={() => { resetAnimalForm(); setAddAnimalModalVisible(false); }} style={{ marginTop: 20, padding: 10 }} activeOpacity={0.7}>
                  <Text style={{ fontSize: 16, color: '#2E2A26', fontWeight: '600' }}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ flex: 1, backgroundColor: '#FFF8F1' }}>
              <View style={{ backgroundColor: '#FF5722', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <TouchableOpacity onPress={() => setFormStep(1)} activeOpacity={0.7}>
                  <Icon name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF' }}>Informations de base</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => { resetAnimalForm(); setAddAnimalModalVisible(false); }} activeOpacity={0.7}>
                  <Icon name="close" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                  <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                    <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#FF5722', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {animalPhoto ? (
                        <Image source={{ uri: animalPhoto }} style={{ width: '100%', height: '100%' }} />
                      ) : (
                        <Icon name="camera" size={40} color="#FF5722" />
                      )}
                    </View>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 14, color: '#6B6660', marginTop: 8 }}>Photo de profil</Text>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#2E2A26', marginBottom: 8 }}>Nom</Text>
                  <TextInput
                    style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EADBC8', borderRadius: 8, padding: 12, fontSize: 16, color: '#2E2A26' }}
                    placeholder="Entrez le nom de l'animal"
                    value={animalNom}
                    onChangeText={setAnimalNom}
                  />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#2E2A26', marginBottom: 8 }}>Race</Text>
                  <TextInput
                    style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EADBC8', borderRadius: 8, padding: 12, fontSize: 16, color: '#2E2A26' }}
                    placeholder="Entrez la race"
                    value={animalRace}
                    onChangeText={setAnimalRace}
                  />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#2E2A26', marginBottom: 8 }}>Date de naissance</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EADBC8', borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 16, color: animalDateNaissance ? '#2E2A26' : '#999' }}>
                      {animalDateNaissance ? animalDateNaissance.toLocaleDateString('fr-FR') : 'Sélectionnez une date'}
                    </Text>
                    <Icon name="calendar" size={20} color="#FF5722" />
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={animalDateNaissance || new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setAnimalDateNaissance(selectedDate);
                      }}
                    />
                  )}
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#2E2A26', marginBottom: 8 }}>Sexe</Text>
                  <View style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EADBC8', borderRadius: 8, overflow: 'hidden' }}>
                    <Picker
                      selectedValue={animalSexe}
                      onValueChange={(itemValue) => setAnimalSexe(itemValue)}
                      style={{ height: 50 }}
                    >
                      <Picker.Item label="Sélectionnez le sexe" value="" />
                      <Picker.Item label="Mâle" value="male" />
                      <Picker.Item label="Femelle" value="femelle" />
                    </Picker>
                  </View>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#2E2A26', marginBottom: 8 }}>Taille</Text>
                  <View style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EADBC8', borderRadius: 8, overflow: 'hidden' }}>
                    <Picker
                      selectedValue={animalTaille}
                      onValueChange={(itemValue) => setAnimalTaille(itemValue)}
                      style={{ height: 50 }}
                    >
                      <Picker.Item label="Sélectionnez la taille" value="" />
                      <Picker.Item label="Petit" value="petit" />
                      <Picker.Item label="Moyen" value="moyen" />
                      <Picker.Item label="Grand" value="grand" />
                    </Picker>
                  </View>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#2E2A26', marginBottom: 8 }}>Type de poil</Text>
                  <View style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EADBC8', borderRadius: 8, overflow: 'hidden' }}>
                    <Picker
                      selectedValue={animalTypePoil}
                      onValueChange={(itemValue) => setAnimalTypePoil(itemValue)}
                      style={{ height: 50 }}
                    >
                      <Picker.Item label="Sélectionnez le type de poil" value="" />
                      <Picker.Item label="Court" value="court" />
                      <Picker.Item label="Mi-long" value="mi-long" />
                      <Picker.Item label="Long" value="long" />
                    </Picker>
                  </View>
                </View>

                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#2E2A26', marginBottom: 8 }}>Description</Text>
                  <TextInput
                    style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EADBC8', borderRadius: 8, padding: 12, fontSize: 16, color: '#2E2A26', minHeight: 100, textAlignVertical: 'top' }}
                    placeholder="Décrivez votre animal..."
                    value={animalDescription}
                    onChangeText={setAnimalDescription}
                    multiline
                  />
                </View>

                {/* Santé & Soins Section */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#2E2A26', marginBottom: 16 }}>Santé & Soins</Text>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#2E2A26', marginBottom: 8 }}>Poids (kg)</Text>
                    <TextInput
                      style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EADBC8', borderRadius: 8, padding: 12, fontSize: 16, color: '#2E2A26' }}
                      placeholder="Entrez le poids"
                      value={animalPoids}
                      onChangeText={setAnimalPoids}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#2E2A26', marginBottom: 8 }}>Allergies</Text>
                    <TextInput
                      style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EADBC8', borderRadius: 8, padding: 12, fontSize: 16, color: '#2E2A26', minHeight: 80, textAlignVertical: 'top' }}
                      placeholder="Listez les allergies connues..."
                      value={animalAllergies}
                      onChangeText={setAnimalAllergies}
                      multiline
                    />
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#2E2A26', marginBottom: 8 }}>Vaccinations</Text>
                    <TextInput
                      style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EADBC8', borderRadius: 8, padding: 12, fontSize: 16, color: '#2E2A26', minHeight: 80, textAlignVertical: 'top' }}
                      placeholder="Listez les vaccinations..."
                      value={animalVaccinations}
                      onChangeText={setAnimalVaccinations}
                      multiline
                    />
                  </View>
                </View>

                {/* Personnalité Section */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#2E2A26', marginBottom: 16 }}>Personnalité</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {personalityTags.map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        onPress={() => {
                          if (selectedPersonalityTags.includes(tag)) {
                            setSelectedPersonalityTags(selectedPersonalityTags.filter(t => t !== tag));
                          } else {
                            setSelectedPersonalityTags([...selectedPersonalityTags, tag]);
                          }
                        }}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: selectedPersonalityTags.includes(tag) ? '#FF5722' : '#EADBC8',
                          backgroundColor: selectedPersonalityTags.includes(tag) ? '#FF5722' : '#FFF',
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={{ fontSize: 14, fontWeight: '600', color: selectedPersonalityTags.includes(tag) ? '#FFF' : '#2E2A26' }}>{tag}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              {/* Buttons */}
              <View style={{ padding: 24, paddingBottom: 40, backgroundColor: '#FFF8F1' }}>
                <TouchableOpacity
                  style={{ backgroundColor: '#FF5722', paddingVertical: 16, borderRadius: 25, alignItems: 'center', marginBottom: 12, flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                  onPress={handleCreatePet}
                  activeOpacity={0.8}
                  disabled={isCreatingPet}
                >
                  {isCreatingPet ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF' }}>Créer</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => { resetAnimalForm(); setAddAnimalModalVisible(false); }}
                  style={{ alignItems: 'center', padding: 12 }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 16, color: '#2E2A26', fontWeight: '600' }}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Modal>
      </SafeAreaView>
    );
  }

  if (currentTab === 'petProfile' && currentAnimal) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9F1' }}>
        <PetProfileScreen
          animalData={currentAnimal}
          onNavigate={setCurrentTab}
          onAddAnother={() => {
            setFormStep(1);
            setSelectedSpecies(null);
            setCurrentTab('animals');
            setAddAnimalModalVisible(true);
          }}
          onUpdatePet={(updatedPet) => {
            setCurrentAnimal(updatedPet);
            mutatePets(); // Recharge la liste depuis le serveur
          }}
           onDeletePet={(deletedPetId) => {
             setCurrentAnimal(null);
             setCurrentTab('animals'); // Retour à la liste des animaux
             mutatePets(); // Recharge la liste depuis le serveur
           }}
        />
        <TabBar currentTab="animals" setCurrentTab={setCurrentTab} />
      </SafeAreaView>
    );
  }

  if (currentTab === 'messages') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9F1' }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => setCurrentTab('profile')} activeOpacity={0.7}>
              <Icon name="person" size={20} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerLogo}>gali<Text style={styles.headerLogoAccent}>'</Text>pet</Text>
            <View style={styles.headerRightIcons}>
              <TouchableOpacity onPress={() => handleHeaderIconPress('messages')} activeOpacity={0.7}>
                <Icon name="chatbubble-ellipses" size={22} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => console.log('calendar')} activeOpacity={0.7}>
                <Icon name="calendar" size={22} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => console.log('notifications')} activeOpacity={0.7}>
                <Icon name="notifications" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* CONTENU CENTRÉ */}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <Icon name="chatbubble-ellipses-outline" size={48} color="#6B6660" />
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#2E2A26', marginTop: 12 }}>Messages</Text>
            <Text style={{ fontSize: 14, color: '#6B6660', marginTop: 8 }}>Vos conversations</Text>
          </View>
        </ScrollView>
        <TabBar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9F1' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => setCurrentTab('profile')} activeOpacity={0.7}>
            <Icon name="person" size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerLogo}>gali<Text style={styles.headerLogoAccent}>'</Text>pet</Text>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity onPress={() => handleHeaderIconPress('messages')} activeOpacity={0.7}>
              <Icon name="chatbubble-ellipses" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('calendar')} activeOpacity={0.7}>
              <Icon name="calendar" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('notifications')} activeOpacity={0.7}>
              <Icon name="notifications" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SALUTATION */}
        <View style={styles.salutation}>
          <Text style={styles.salutationText}>Bonjour {firstName ? firstName : ''} !</Text>
          <Text style={styles.salutationSubtext}>Que cherchez-vous aujourd'hui ?</Text>
        </View>

        {/* VILLE SELECTOR */}
        <TouchableOpacity style={styles.citySelector} activeOpacity={0.7}>
          <Icon name="location" size={16} color="#E87A5D" />
          <Text style={styles.cityText}>Paris</Text>
          <Icon name="chevron-down" size={12} color="#E87A5D" />
        </TouchableOpacity>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={18} color="#999" />
            <TextInput style={styles.searchInput} placeholder="Rechercher des services, prestataires." placeholderTextColor="#999" />
          </View>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
            <Icon name="options" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* VIEW TOGGLE */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]} onPress={() => setViewMode('grid')} activeOpacity={0.7}>
            <Icon name="grid" size={18} color={viewMode === 'grid' ? '#FFF' : '#2E2A26'} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]} onPress={() => setViewMode('map')} activeOpacity={0.7}>
            <Icon name="map" size={18} color={viewMode === 'map' ? '#FFF' : '#2E2A26'} />
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
              <Icon name="map" size={40} color="#6B6660" />
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
      </ScrollView>

      {/* BOTTOM TAB BAR */}
      <TabBar currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </SafeAreaView>
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

  // TAB BAR - FIXED POSITION
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#FFF9F1',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    // shadow pour iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation pour Android
    elevation: 8,
    zIndex: 1000,
  },
   tabItem: { alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, flex: 1 },
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