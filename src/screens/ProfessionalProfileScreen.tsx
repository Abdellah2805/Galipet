import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from '../components/Icon';
import useSWR from 'swr';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useSupabase';
import { colors, radius } from '../theme/colors';

const WorkingHoursEditor = ({ hours, onChange }: any) => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  const updateDay = (dayIndex: number, field: 'open' | 'close', value: string) => {
    const newHours = [...hours];
    if (!newHours[dayIndex]) {
      newHours[dayIndex] = { open: '', close: '' };
    }
    newHours[dayIndex][field] = value;
    onChange(newHours);
  };

  return (
    <View style={styles.hoursEditor}>
      {days.map((day, idx) => (
        <View key={idx} style={styles.hoursRow}>
          <Text style={styles.hoursDay}>{day}</Text>
          <View style={styles.hoursInputs}>
            <TextInput
              style={styles.hoursInput}
              placeholder="09:00"
              value={hours[idx]?.open || ''}
              onChangeText={(t) => updateDay(idx, 'open', t)}
              placeholderTextColor="#999"
            />
            <Text style={styles.hoursSeparator}>à</Text>
            <TextInput
              style={styles.hoursInput}
              placeholder="18:00"
              value={hours[idx]?.close || ''}
              onChangeText={(t) => updateDay(idx, 'close', t)}
              placeholderTextColor="#999"
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const EditableSection = ({ title, icon, children, onEdit, isEditing, isLoading }: any) => (
  <View style={styles.editableSection}>
    <View style={styles.editableHeader}>
      <View style={styles.editableTitleRow}>
        <View style={[styles.editableIcon, { backgroundColor: colors.primary + '15' }]}>
          <Icon name={icon} size={20} color={colors.primary} />
        </View>
        <Text style={styles.editableSectionTitle}>{title}</Text>
      </View>
      {isEditing && (
        <TouchableOpacity onPress={onEdit} style={styles.editPencilBtn} activeOpacity={0.7}>
          <Icon name="pencil" size={18} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
    {isLoading ? (
      <View style={styles.sectionLoading}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    ) : (
      children
    )}
  </View>
);

// Fetcher générique pour Supabase
const supabaseFetcher = async (queryFn: (supabase: any) => Promise<any>) => {
  const supabase = getSupabase();
  const result = await queryFn(supabase);
  if (result.error) {
    throw result.error;
  }
  return result.data;
};

export default function ProfessionalProfileScreen({ onNavigate }: any) {
  const { session } = useAuth();
  const supabase = getSupabase();
  const { data: profileData, isLoading: isProfileLoading, mutate: mutateProfile } = useProfile(session?.user?.id);
  
  const [activeTab, setActiveTab] = useState<'profil' | 'aperçu'>('profil');
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    siret_or_id: '',
    phone: '',
    address: '',
    specialization: '',
    cover_image: '',
    bio: '',
  });
  
  const [workingHours, setWorkingHours] = useState<Array<{open: string; close: string}>>([]);
  const [personalInfo, setPersonalInfo] = useState({
    full_name: '',
    birth_date: '',
    role: 'Éleveur',
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // Load working hours from company profile - MUST be before early return to avoid conditional hook calls
  const { data: hoursData, isLoading: isLoadingHours } = useSWR(
    session?.user?.id ? ['company_hours', session.user.id] : null,
    () =>
      supabaseFetcher((supabase) =>
        supabase
          .from('company_profiles')
          .select('working_hours')
          .eq('id', session.user.id)
          .single()
      ),
    { revalidateOnFocus: false }
  );

  // Load data when profile loads - MUST be before early return to avoid conditional hook calls
  useEffect(() => {
    if (profileData) {
      const companyProfile = Array.isArray(profileData.company_profiles)
        ? profileData.company_profiles[0]
        : profileData.company_profiles;
      
      if (companyProfile) {
        setFormData({
          company_name: companyProfile.company_name || '',
          contact_name: companyProfile.contact_name || '',
          siret_or_id: companyProfile.siret_or_id || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          specialization: companyProfile.specialization || '',
          cover_image: companyProfile.cover_image || '',
          bio: companyProfile.bio || '',
        });
        setPersonalInfo({
          full_name: companyProfile.contact_name || '',
          birth_date: profileData.birth_date || '',
          role: companyProfile.role || 'Éleveur',
        });
      }
    }
  }, [profileData]);

  // Handle working hours updates - MUST be before early return to avoid conditional hook calls
  useEffect(() => {
    if (hoursData?.working_hours) {
      setWorkingHours(hoursData.working_hours);
    } else if (session?.user?.id) {
      // Default empty hours only when we have a session but no stored hours
      setWorkingHours(Array(7).fill({ open: '', close: '' }));
    }
  }, [hoursData, session?.user?.id]);

  // Show loading while profile is loading or no session
  if (!session || isProfileLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!session?.user) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: formData.phone,
          address: formData.address,
          birth_date: personalInfo.birth_date || null,
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      // Update company_profiles table
      const { error: companyError } = await supabase
        .from('company_profiles')
        .update({
          company_name: formData.company_name,
          contact_name: formData.contact_name,
          siret_or_id: formData.siret_or_id,
          specialization: formData.specialization,
          bio: formData.bio,
          cover_image: formData.cover_image,
          working_hours: workingHours,
          role: personalInfo.role,
        })
        .eq('id', session.user.id);

      if (companyError) throw companyError;

      await mutateProfile();
      setIsEditing(false);
      setSaveMessage('Modifications enregistrées !');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setSaveMessage('Erreur lors de la sauvegarde');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const renderProfilTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Personal Info Section */}
      <EditableSection
        title="Informations personnelles"
        icon="person"
        isEditing={isEditing}
        isLoading={isProfileLoading}
      >
        <View style={styles.personalSection}>
          <View style={styles.avatarUpload}>
            <View style={styles.avatarLarge}>
              <Icon name="person" size={40} color={colors.primary} />
            </View>
            <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.7}>
              <Icon name="camera" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Nom complet</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={personalInfo.full_name}
              onChangeText={(t) => setPersonalInfo(prev => ({ ...prev, full_name: t }))}
              editable={isEditing}
              placeholder="Nom complet"
            />
          </View>
          
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Date de naissance</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={personalInfo.birth_date}
              onChangeText={(t) => setPersonalInfo(prev => ({ ...prev, birth_date: t }))}
              editable={isEditing}
              placeholder="JJ/MM/AAAA"
            />
          </View>
          
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Rôle</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={personalInfo.role}
              onChangeText={(t) => setPersonalInfo(prev => ({ ...prev, role: t }))}
              editable={isEditing}
              placeholder="Ex: Éleveur"
            />
          </View>
        </View>
      </EditableSection>

      {/* Working Hours Section */}
      <EditableSection
        title="Horaires de travail"
        icon="clock"
        isEditing={isEditing}
        isLoading={isLoadingHours}
      >
        <WorkingHoursEditor hours={workingHours} onChange={setWorkingHours} />
      </EditableSection>

      {/* Company Info Section */}
      <EditableSection
        title="Informations entreprise"
        icon="building"
        isEditing={isEditing}
        isLoading={isProfileLoading}
      >
        <View style={styles.companySection}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Nom de l'entreprise</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.company_name}
              onChangeText={(t) => handleFieldChange('company_name', t)}
              editable={isEditing}
              placeholder="Nom de l'entreprise"
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Adresse (Ville)</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.address}
              onChangeText={(t) => handleFieldChange('address', t)}
              editable={isEditing}
              placeholder="Ville"
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={session?.user?.email || ''}
              editable={false}
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Téléphone</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.phone}
              onChangeText={(t) => handleFieldChange('phone', t)}
              editable={isEditing}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>SIRET / Identifiant</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.siret_or_id}
              onChangeText={(t) => handleFieldChange('siret_or_id', t)}
              editable={isEditing}
              placeholder="SIRET"
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Spécialité</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.specialization}
              onChangeText={(t) => handleFieldChange('specialization', t)}
              editable={isEditing}
              placeholder="Ex: Vétérinaires & urgences"
            />
          </View>

          <View style={[styles.fieldRow, { minHeight: 100 }]}>
            <Text style={styles.fieldLabel}>Bio / Description</Text>
            <TextInput
              style={[styles.textArea, !isEditing && styles.inputDisabled]}
              value={formData.bio}
              onChangeText={(t) => handleFieldChange('bio', t)}
              editable={isEditing}
              placeholder="Décrivez votre entreprise..."
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      </EditableSection>

      {/* Save Button / Message */}
      <View style={styles.saveContainer}>
        {saveMessage && (
          <View style={styles.saveMessage}>
            <Text style={styles.saveMessageText}>{saveMessage}</Text>
          </View>
        )}
        
        {isEditing ? (
          <View style={styles.editButtons}>
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setIsEditing(false)} activeOpacity={0.7}>
              <Text style={styles.btnCancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.btn, styles.btnSave, isSaving && styles.btnDisabled]} 
              onPress={handleSave} 
              disabled={isSaving}
              activeOpacity={0.7}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.btnSaveText}>Enregistrer</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={[styles.btn, styles.btnEdit]} onPress={() => setIsEditing(true)} activeOpacity={0.7}>
            <Icon name="pencil" size={18} color="#FFF" />
            <Text style={styles.btnEditText}>Modifier le profil</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={() => supabase?.auth?.signOut()} activeOpacity={0.7}>
        <Icon name="log-out-outline" size={20} color="#C0392B" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderAperçuTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Cover Image */}
      <View style={styles.coverContainer}>
        {formData.cover_image ? (
          <Image source={{ uri: formData.cover_image }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Icon name="image-outline" size={40} color="#999" />
          </View>
        )}
        <View style={styles.coverOverlay} />
        
        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Disponible</Text>
        </View>

        {/* Company Name */}
        <View style={styles.coverContent}>
          <Text style={styles.coverTitle}>{formData.company_name || 'Nom de l\'entreprise'}</Text>
          
          {/* Specialization Badge */}
          <View style={styles.specialtyBadge}>
            <Text style={styles.specialtyText}>{formData.specialization || 'Spécialité'}</Text>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Icon name="star" size={16} color="#F4C28F" />
            <Text style={styles.ratingText}> 5.0</Text>
            <Text style={styles.ratingCount}>(24 avis)</Text>
          </View>
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.infoCards}>
        {/* Speciality Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardIcon}>
             <Icon name="star-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.infoCardContent}>
            <Text style={styles.infoCardLabel}>Spécialité</Text>
            <Text style={styles.infoCardValue}>{formData.specialization || 'Non renseigné'}</Text>
          </View>
        </View>

        {/* Hours Card */}
        <View style={styles.infoCard}>
          <View style={[styles.infoCardIcon, { backgroundColor: '#E8F5E9' }]}>
             <Icon name="time-outline" size={24} color="#7BA988" />
          </View>
          <View style={styles.infoCardContent}>
            <Text style={styles.infoCardLabel}>Horaires</Text>
            <Text style={styles.infoCardValue}>
              {workingHours.length > 0 ? `${workingHours[0]?.open || '--'}:00 - ${workingHours[0]?.close || '--'}:00` : 'Non renseigné'}
            </Text>
          </View>
          <Icon name="chevron-forward" size={18} color={colors.textMuted} />
        </View>

        {/* Address Card */}
        <View style={styles.infoCard}>
          <View style={[styles.infoCardIcon, { backgroundColor: '#E8F4FD' }]}>
            <Icon name="location" size={24} color="#5B9BD5" />
          </View>
          <View style={styles.infoCardContent}>
            <Text style={styles.infoCardLabel}>Adresse</Text>
            <Text style={styles.infoCardValue}>{formData.address || 'Non renseigné'}</Text>
          </View>
        </View>

        {/* Price Card */}
        <View style={styles.infoCard}>
          <View style={[styles.infoCardIcon, { backgroundColor: '#FFF4E8' }]}>
            <Icon name="cash-outline" size={24} color="#E8A838" />
          </View>
          <View style={styles.infoCardContent}>
            <Text style={styles.infoCardLabel}>À partir de</Text>
            <Text style={styles.infoCardValue}>25€</Text>
          </View>
        </View>
      </View>

      {/* More Info Section */}
      <View style={styles.moreInfoSection}>
        <TouchableOpacity style={styles.moreInfoToggle} activeOpacity={0.7}>
          <Text style={styles.moreInfoTitle}>Plus d'informations</Text>
          <Icon name="chevron-down" size={20} color={colors.textMuted} />
        </TouchableOpacity>
        
        <View style={styles.moreInfoContent}>
          <View style={styles.moreInfoRow}>
            <Text style={styles.moreInfoLabel}>Contact</Text>
            <Text style={styles.moreInfoValue}>{session?.user?.email}</Text>
          </View>
          <View style={styles.moreInfoRow}>
            <Text style={styles.moreInfoLabel}>Téléphone</Text>
            <Text style={styles.moreInfoValue}>{formData.phone || 'Non renseigné'}</Text>
          </View>
          <View style={styles.moreInfoRow}>
            <Text style={styles.moreInfoLabel}>Identifiant</Text>
            <Text style={styles.moreInfoValue}>{formData.siret_or_id || 'Non renseigné'}</Text>
          </View>
          {formData.bio ? (
            <View style={styles.moreInfoRow}>
              <Text style={styles.moreInfoLabel}>Description</Text>
              <Text style={[styles.moreInfoValue, styles.moreInfoBio]}>{formData.bio}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'profil' && styles.tabItemActive]}
          onPress={() => setActiveTab('profil')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'profil' && styles.tabTextActive]}>Profil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'aperçu' && styles.tabItemActive]}
          onPress={() => setActiveTab('aperçu')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'aperçu' && styles.tabTextActive]}>Aperçu</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'profil' ? renderProfilTab() : renderAperçuTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 4,
    borderRadius: radius.pill,
    margin: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: '#FFF',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },

  // Editable Section
  editableSection: {
    backgroundColor: '#FFF',
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  editableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  editableTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editableIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  editableSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  editPencilBtn: {
    padding: 4,
  },
  sectionLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  // Personal Section
  personalSection: {
    alignItems: 'center',
  },
  avatarUpload: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },

  // Field Row
  fieldRow: {
    width: '100%',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 15,
    color: colors.text,
  },
  inputDisabled: {
    backgroundColor: '#F8F8F8',
    color: colors.text,
  },
  textArea: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Hours Editor
  hoursEditor: {
    width: '100%',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  hoursDay: {
    width: 50,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  hoursInputs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  hoursInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 10,
    fontSize: 14,
    color: colors.text,
    marginHorizontal: 8,
  },
  hoursSeparator: {
    fontSize: 14,
    color: colors.textMuted,
    position: 'absolute',
    left: '50%',
    marginLeft: -20,
  },

  // Company Section
  companySection: {
    width: '100%',
  },

  // Save Area
  saveContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  saveMessage: {
    backgroundColor: '#27AE60',
    borderRadius: radius.sm,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveMessageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radius.sm,
    gap: 8,
  },
  btnEdit: {
    backgroundColor: colors.primary,
  },
  btnEditText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  btnCancel: {
    backgroundColor: '#F0F0F0',
  },
  btnCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  btnSave: {
    backgroundColor: colors.primary,
  },
  btnSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  btnDisabled: {
    opacity: 0.7,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    borderRadius: radius.lg,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C0392B',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C0392B',
  },

  // Cover Section (Aperçu)
  coverContainer: {
    height: 200,
    backgroundColor: '#E8E8E8',
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  coverContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  coverTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  specialtyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  specialtyText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    color: '#F4C28F',
    fontSize: 14,
    fontWeight: '600',
  },
  ratingCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },

  // Info Cards
  infoCards: {
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: radius.lg,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoCardLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  infoCardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },

  // More Info
  moreInfoSection: {
    backgroundColor: '#FFF',
    borderRadius: radius.lg,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  moreInfoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moreInfoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  moreInfoContent: {
    marginTop: 16,
  },
  moreInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  moreInfoLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  moreInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
    flex: 1,
  },
  moreInfoBio: {
    textAlign: 'left',
    marginTop: 4,
  },
});
