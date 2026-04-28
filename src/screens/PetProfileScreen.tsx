import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import Icon from '../components/Icon';
import { colors, spacing } from '../theme/colors';
import { getSupabase } from '../lib/supabase';
import { usePetPhotos } from '../hooks/useSupabase';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const uploadToCloudinary = async (imageUri: string, folder: string): Promise<string | null> => {
  return null;
};

type TabType = 'explore' | 'animals' | 'messages' | 'profile' | 'petProfile';

interface Pet {
  id: string;
  species: string | null;
  profile_image_url: string | null;
  name: string;
  breed: string;
  birth_date: string | null;
  gender: string | null;
  size: string | null;
  coat_type: string | null;
  description: string | null;
  weight_kg: number | null;
  personality_traits: string[];
  allergies: any;
  vaccinations: any;
}

interface PetProfileScreenProps {
  animalData: Pet;
  onNavigate: (tab: TabType) => void;
  onAddAnother: () => void;
  onUpdatePet: (updatedPet: Pet) => void;
  onDeletePet: (deletedPetId: string) => void;
}

export default function PetProfileScreen({ animalData, onNavigate, onAddAnother, onUpdatePet, onDeletePet }: PetProfileScreenProps) {
  const { data: galleryPhotos, isLoading: isLoadingGallery, mutate: mutatePhotos } = usePetPhotos(animalData.id);
  const [activeTab, setActiveTab] = useState<'preview' | 'profile'>('preview');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState<'basic' | 'health' | null>(null);
  const [editedPet, setEditedPet] = useState<Pet>(animalData);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [localPetData, setLocalPetData] = useState<Pet>(animalData);
  const supabase = getSupabase();

  useEffect(() => {
    setLocalPetData(animalData);
    setEditedPet(animalData);
  }, [animalData]);

  const pickGalleryImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadGalleryPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image', error);
    }
  };

  const uploadGalleryPhoto = async (imageUri: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const publicUrl = await uploadToCloudinary(imageUri, 'pet-gallery');

      if (!publicUrl) {
        Alert.alert('Erreur', 'Erreur lors du téléchargement de la photo');
        return;
      }

      const { error: insertError } = await supabase
        .from('pet_photos')
        .insert([
          {
            pet_id: animalData.id,
            photo_url: publicUrl,
            uploaded_by: user.id,
          },
        ]);

      if (insertError) throw insertError;

      mutatePhotos();
    } catch (error) {
      console.error('Error uploading gallery photo', error);
      Alert.alert('Erreur', 'Erreur lors du téléchargement de la photo');
    }
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const openEditModal = (section: 'basic' | 'health') => {
    setEditedPet(localPetData);
    setEditingSection(section);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditingSection(null);
    setEditedPet(localPetData);
  };

  const handleSaveEdit = async () => {
    try {
      setIsLoadingSave(true);
      
      const { error } = await supabase
        .from('pets')
        .update({
          name: editedPet.name,
          breed: editedPet.breed,
          birth_date: editedPet.birth_date,
          gender: editedPet.gender,
          size: editedPet.size,
          coat_type: editedPet.coat_type,
          description: editedPet.description,
          weight_kg: editedPet.weight_kg,
          personality_traits: editedPet.personality_traits,
          allergies: localPetData.allergies,
          vaccinations: localPetData.vaccinations,
        })
        .eq('id', localPetData.id);

      if (error) throw error;

      const updatedPet = { ...localPetData, ...editedPet };
      setLocalPetData(updatedPet);
      onUpdatePet(updatedPet);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
      closeEditModal();
    } catch (error) {
      console.error('Error updating pet', error);
      Alert.alert('Erreur', 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoadingSave(false);
    }
  };

  const pickProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image', error);
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    try {
      const publicUrl = await uploadToCloudinary(imageUri, 'pet-profile');

      if (!publicUrl) {
        Alert.alert('Erreur', 'Erreur lors du téléchargement de la photo');
        return;
      }

      const { error: updateError } = await supabase
        .from('pets')
        .update({ profile_image_url: publicUrl })
        .eq('id', localPetData.id);

      if (updateError) throw updateError;

      const updatedPet = { ...localPetData, profile_image_url: publicUrl };
      setLocalPetData(updatedPet);
      onUpdatePet(updatedPet);
    } catch (error) {
      console.error('Error uploading profile image', error);
      Alert.alert('Erreur', 'Erreur lors du téléchargement de la photo');
    }
  };

  const togglePersonalityTrait = (trait: string) => {
    const currentTraits = editedPet.personality_traits || [];
    if (currentTraits.includes(trait)) {
      setEditedPet({
        ...editedPet,
        personality_traits: currentTraits.filter(t => t !== trait)
      });
    } else {
      setEditedPet({
        ...editedPet,
        personality_traits: [...currentTraits, trait]
      });
    }
  };

  const personalityTags = ['Joueur', 'Calme', 'Affectueux', 'Énergique', 'Câlin', 'Indépendant', 'Sociable', 'Curieux', 'Gourmand', 'Protecteur'];

  const handleDeletePet = () => {
    Alert.alert(
      'Supprimer le profil',
      'Êtes-vous sûr de vouloir supprimer ce profil ? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('pets')
                .delete()
                .eq('id', localPetData.id);

              if (error) throw error;

              Alert.alert('Succès', 'Profil supprimé avec succès');
              onDeletePet(localPetData.id);
              onNavigate('animals');
            } catch (error) {
              console.error('Error deleting pet', error);
              Alert.alert('Erreur', 'Erreur lors de la suppression du profil');
            }
          },
        },
      ]
    );
  };

  const age = calculateAge(localPetData.birth_date);
  return (
    <View style={styles.container}>
      {/* Header Orange */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={pickProfileImage} activeOpacity={0.7}>
            <View style={styles.profileImageContainer}>
              {localPetData.profile_image_url ? (
                <Image 
                  source={{ uri: localPetData.profile_image_url }} 
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <Icon name="paw" size={24} color="#FF5722" />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={onAddAnother} activeOpacity={0.7}>
            <View style={styles.addButtonInner}>
              <Icon name="add" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.headerLogo}>gali<Text style={styles.headerLogoAccent}>'</Text>pet</Text>

        <View style={styles.headerRightIcons}>
          <TouchableOpacity onPress={() => onNavigate('messages')} activeOpacity={0.7}>
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

      {/* Switch Preview/Profile */}
      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[styles.switchButton, activeTab === 'preview' && styles.switchButtonActive]}
          onPress={() => setActiveTab('preview')}
          activeOpacity={0.7}
        >
          <Text style={[styles.switchButtonText, activeTab === 'preview' && styles.switchButtonTextActive]}>
            Preview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchButton, activeTab === 'profile' && styles.switchButtonActive]}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.7}
        >
          <Text style={[styles.switchButtonText, activeTab === 'profile' && styles.switchButtonTextActive]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'preview' ? (
          <View style={styles.previewContainer}>
            <View style={styles.previewCard}>
              {localPetData.profile_image_url ? (
                <Image 
                  source={{ uri: localPetData.profile_image_url }} 
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.previewImagePlaceholder}>
                  <Icon name="paw" size={64} color="#FF5722" />
                </View>
              )}
              <View style={styles.previewOverlay}>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>{localPetData.name}</Text>
                  <Text style={styles.previewBreed}>{localPetData.breed}</Text>
                  {age !== null && <Text style={styles.previewAge}>{age} ans</Text>}
                </View>
                
                {localPetData.personality_traits && localPetData.personality_traits.length > 0 && (
                  <View style={styles.badgesContainer}>
                    {localPetData.personality_traits.map((trait, index) => (
                      <View key={index} style={styles.badge}>
                        <Text style={styles.badgeText}>{trait}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity style={styles.viewProfileButton} onPress={() => setActiveTab('profile')}>
                  <Text style={styles.viewProfileButtonText}>Voir le profil complet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.profileContainer}>
            {/* Informations de base */}
            <TouchableOpacity style={styles.section} onPress={() => openEditModal('basic')} activeOpacity={0.7}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Informations de base</Text>
                <TouchableOpacity onPress={(e) => { e.stopPropagation(); openEditModal('basic'); }} style={styles.editIcon}>
                  <Icon name="pencil" size={20} color="#FF5722" />
                </TouchableOpacity>
              </View>
              <View style={styles.sectionContent}>
                <Text style={styles.infoLabel}>Nom: <Text style={styles.infoValue}>{localPetData.name}</Text></Text>
                <Text style={styles.infoLabel}>Espèce: <Text style={styles.infoValue}>{localPetData.species === 'chien' ? 'Chien' : 'Chat'}</Text></Text>
                {localPetData.breed && <Text style={styles.infoLabel}>Race: <Text style={styles.infoValue}>{localPetData.breed}</Text></Text>}
                {localPetData.gender && <Text style={styles.infoLabel}>Sexe: <Text style={styles.infoValue}>{localPetData.gender === 'male' ? 'Mâle' : 'Femelle'}</Text></Text>}
                {localPetData.size && <Text style={styles.infoLabel}>Taille: <Text style={styles.infoValue}>{localPetData.size}</Text></Text>}
                {localPetData.weight_kg && <Text style={styles.infoLabel}>Poids: <Text style={styles.infoValue}>{localPetData.weight_kg} kg</Text></Text>}
                {age !== null && <Text style={styles.infoLabel}>Âge: <Text style={styles.infoValue}>{age} ans</Text></Text>}
              </View>
            </TouchableOpacity>

            {/* Personnalité */}
            {localPetData.personality_traits && localPetData.personality_traits.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Personnalité</Text>
                  <TouchableOpacity onPress={(e) => { e.stopPropagation(); openEditModal('basic'); }} style={styles.editIcon}>
                    <Icon name="pencil" size={20} color="#FF5722" />
                  </TouchableOpacity>
                </View>
                <View style={styles.tagsContainer}>
                  {localPetData.personality_traits.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Santé */}
            <TouchableOpacity style={styles.section} onPress={() => openEditModal('health')} activeOpacity={0.7}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Santé</Text>
                <TouchableOpacity onPress={(e) => { e.stopPropagation(); openEditModal('health'); }} style={styles.editIcon}>
                  <Icon name="pencil" size={20} color="#FF5722" />
                </TouchableOpacity>
              </View>
              <View style={styles.sectionContent}>
                {localPetData.description && <Text style={styles.infoText}>Description: <Text style={styles.infoValue}>{localPetData.description}</Text></Text>}
                {localPetData.coat_type && <Text style={styles.infoLabel}>Type de poil: <Text style={styles.infoValue}>{localPetData.coat_type}</Text></Text>}
                {localPetData.allergies && Array.isArray(localPetData.allergies) && localPetData.allergies.length > 0 && (
                  <Text style={styles.infoLabel}>Allergies: <Text style={styles.infoValue}>{localPetData.allergies.join(', ')}</Text></Text>
                )}
                {localPetData.vaccinations && Array.isArray(localPetData.vaccinations) && localPetData.vaccinations.length > 0 && (
                  <Text style={styles.infoLabel}>Vaccinations: <Text style={styles.infoValue}>{localPetData.vaccinations.join(', ')}</Text></Text>
                )}
                {!localPetData.description && !localPetData.coat_type && (!localPetData.allergies || localPetData.allergies.length === 0) && (!localPetData.vaccinations || localPetData.vaccinations.length === 0) && (
                  <Text style={styles.infoText}>Aucune information de santé renseignée</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Galerie Photos */}
            <View style={styles.galleryContainer}>
              <Text style={styles.sectionTitle}>Galerie photos</Text>
              <View style={styles.galleryGrid}>
                {(galleryPhotos || []).map((photo) => {
                  return (
                    <View key={photo.id} style={styles.galleryPhoto}>
                      {photo.photo_url ? (
                        <Image 
                          source={{ uri: photo.photo_url }} 
                          style={styles.galleryPhotoImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.galleryPhotoPlaceholder}>
                          <Icon name="image-outline" size={32} color="#ccc" />
                        </View>
                      )}
                    </View>
                  );
                })}
                {(galleryPhotos || []).length < 8 && (
                  <TouchableOpacity style={styles.addPhotoButton} onPress={pickGalleryImage} activeOpacity={0.7}>
                    <View style={styles.addPhotoButtonInner}>
                      <Icon name="add" size={24} color="#FF5722" />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
              {isLoadingGallery && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FF5722" />
                </View>
              )}
            </View>

            {/* Bouton Supprimer */}
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePet} activeOpacity={0.7}>
              <Icon name="trash-outline" size={20} color="#FFF" />
              <Text style={styles.deleteButtonText}>Supprimer le profil</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal de modification */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeEditModal} activeOpacity={0.7}>
              <Icon name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingSection === 'basic' ? 'Modifier infos de base' : 'Modifier santé'}
            </Text>
            <TouchableOpacity onPress={handleSaveEdit} disabled={isLoadingSave} activeOpacity={0.7}>
              {isLoadingSave ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.modalSaveButton}>Enregistrer</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {editingSection === 'basic' ? (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nom</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editedPet.name}
                    onChangeText={(text) => setEditedPet({ ...editedPet, name: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Race</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editedPet.breed}
                    onChangeText={(text) => setEditedPet({ ...editedPet, breed: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Date de naissance</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={styles.formInput}
                    activeOpacity={0.7}
                  >
                    <Text style={editedPet.birth_date ? styles.formValue : styles.formPlaceholder}>
                      {editedPet.birth_date ? new Date(editedPet.birth_date).toLocaleDateString('fr-FR') : 'Sélectionner une date'}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={editedPet.birth_date ? new Date(editedPet.birth_date) : new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          setEditedPet({
                            ...editedPet,
                            birth_date: selectedDate.toISOString().split('T')[0]
                          });
                        }
                      }}
                    />
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Sexe</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={editedPet.gender}
                      onValueChange={(value) => setEditedPet({ ...editedPet, gender: value })}
                      style={styles.picker}
                    >
                      <Picker.Item label="Non spécifié" value="" />
                      <Picker.Item label="Mâle" value="male" />
                      <Picker.Item label="Femelle" value="femelle" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Taille</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={editedPet.size}
                      onValueChange={(value) => setEditedPet({ ...editedPet, size: value })}
                      style={styles.picker}
                    >
                      <Picker.Item label="Non spécifié" value="" />
                      <Picker.Item label="Petit" value="petit" />
                      <Picker.Item label="Moyen" value="moyen" />
                      <Picker.Item label="Grand" value="grand" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Poids (kg)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editedPet.weight_kg ? editedPet.weight_kg.toString() : ''}
                    onChangeText={(text) => setEditedPet({ ...editedPet, weight_kg: text ? parseFloat(text) : null })}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Personnalité</Text>
                  <View style={styles.personalityTagsContainer}>
                    {personalityTags.map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        onPress={() => togglePersonalityTrait(tag)}
                        style={[
                          styles.personalityTag,
                          editedPet.personality_traits && editedPet.personality_traits.includes(tag) && styles.personalityTagActive
                        ]}
                        activeOpacity={0.8}
                      >
                        <Text style={[
                          styles.personalityTagText,
                          editedPet.personality_traits && editedPet.personality_traits.includes(tag) && styles.personalityTagTextActive
                        ]}>
                          {tag}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Description</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextArea]}
                    value={editedPet.description || ''}
                    onChangeText={(text) => setEditedPet({ ...editedPet, description: text })}
                    multiline
                    numberOfLines={4}
                    placeholder="Décrivez votre animal..."
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Type de poil</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={editedPet.coat_type}
                      onValueChange={(value) => setEditedPet({ ...editedPet, coat_type: value })}
                      style={styles.picker}
                    >
                      <Picker.Item label="Non spécifié" value="" />
                      <Picker.Item label="Court" value="court" />
                      <Picker.Item label="Mi-long" value="mi-long" />
                      <Picker.Item label="Long" value="long" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Allergies</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextArea]}
                    value={Array.isArray(localPetData.allergies) ? localPetData.allergies.join(', ') : ''}
                    onChangeText={(text) => setLocalPetData({
                      ...localPetData,
                      allergies: text.split(',').map(s => s.trim()).filter(s => s.length > 0)
                    })}
                    multiline
                    numberOfLines={3}
                    placeholder="Listez les allergies (séparées par des virgules)"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Vaccinations</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextArea]}
                    value={Array.isArray(localPetData.vaccinations) ? localPetData.vaccinations.join(', ') : ''}
                    onChangeText={(text) => setLocalPetData({
                      ...localPetData,
                      vaccinations: text.split(',').map(s => s.trim()).filter(s => s.length > 0)
                    })}
                    multiline
                    numberOfLines={3}
                    placeholder="Listez les vaccinations (séparées par des virgules)"
                  />
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F1' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF5722',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImage: { 
    width: 40, 
    height: 40,
  },
  addButton: { marginLeft: 4 },
  addButtonInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFF',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  headerLogoAccent: { color: '#FFF' },
  headerRightIcons: { flexDirection: 'row', gap: 16 },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 25,
    padding: 4,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  switchButtonActive: {
    backgroundColor: '#FF5722',
  },
  switchButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  switchButtonTextActive: {
    color: '#fff',
  },
  scrollView: { flex: 1 },
  previewContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  previewCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 400,
  },
  previewImage: {
    width: 400,
    height: 400,
  },
  previewImagePlaceholder: {
    width: 400,
    height: 400,
    backgroundColor: '#FFCCB3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  previewInfo: {
    marginTop: 20,
  },
  previewName: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  previewBreed: {
    color: '#fff',
    fontSize: 20,
    marginTop: 4,
  },
  previewAge: {
    color: '#fff',
    fontSize: 16,
    marginTop: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  viewProfileButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  viewProfileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileContainer: { padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#2E2A26', marginBottom: 8 },
  species: { fontSize: 16, color: '#FF5722', fontWeight: '600', marginBottom: 16 },
  detail: { fontSize: 14, color: '#6B6660', marginBottom: 8 },
  personalityContainer: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2E2A26', marginBottom: 12 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FF5722',
  },
  tagText: { fontSize: 12, color: '#FFF', fontWeight: '600' },
  galleryContainer: {
    marginTop: 32,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  galleryPhoto: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  galleryPhotoImage: {
    width: 160,
    height: 160,
  },
  galleryPhotoPlaceholder: {
    width: 160,
    height: 160,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF5722',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editIcon: {
    padding: 8,
  },
  sectionContent: {
    gap: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    color: '#333',
    fontWeight: '600',
  },
  infoText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF8F1',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF5722',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalSaveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E2A26',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EADBC8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2E2A26',
  },
  formValue: {
    fontSize: 16,
    color: '#2E2A26',
  },
  formPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  formTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EADBC8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  personalityTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  personalityTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  personalityTagActive: {
    backgroundColor: '#FF5722',
    borderColor: '#FF5722',
  },
  personalityTagText: {
    fontSize: 14,
    color: '#2E2A26',
    fontWeight: '500',
  },
  personalityTagTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC3545',
    paddingVertical: 16,
    borderRadius: 25,
    marginTop: 24,
    marginBottom: 40,
    gap: 8,
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
