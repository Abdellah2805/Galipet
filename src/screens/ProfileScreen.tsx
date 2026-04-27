import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const isCompanyRole = (role: string | null) => role === 'professional' || role === 'company';

const CUSTOMER_FIELDS = [
  { key: 'first_name', label: 'Prénom', icon: '👤', editable: true },
  { key: 'last_name', label: 'Nom', icon: '👤', editable: true },
  { key: 'birth_date', label: 'Date de naissance', icon: '📅', editable: true },
  { key: 'phone', label: 'Téléphone', icon: '📱', editable: true },
  { key: 'address', label: 'Adresse', icon: '📍', editable: true },
];

const COMPANY_FIELDS = [
  { key: 'company_name', label: 'Nom de l\'entreprise', icon: '🏢', editable: true },
  { key: 'contact_name', label: 'Nom du contact', icon: '👤', editable: true },
  { key: 'siret_or_id', label: 'SIRET / Identifiant', icon: '🔢', editable: true },
  { key: 'phone', label: 'Téléphone', icon: '📱', editable: true },
  { key: 'address', label: 'Adresse', icon: '📍', editable: true },
];

export default function ProfileScreen({ navigation, onNavigate }: any) {
  const { session, userRole } = useAuth();
  const supabase = getSupabase();
  const navigateFn = onNavigate || navigation?.navigate || (() => {});

  const [userData, setUserData] = useState<any>({
    email: session?.user?.email || '',
    phone: '',
    first_name: '',
    last_name: '',
    birth_date: '',
    address: '',
    company_name: '',
    contact_name: '',
    siret_or_id: '',
  });

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [profileRole, setProfileRole] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      loadUserData();
    }
  }, [session]);

  const loadUserData = async () => {
    if (!session?.user) return;

    console.log('Loading profile for user ID:', session.user.id);

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, customer_profiles(*), company_profiles(*)')
        .eq('id', session.user.id)
        .maybeSingle();

      console.log('Données reçues de Supabase:', data);

      if (error) {
        console.error('Erreur loading profile:', error);
        setLoading(false);
        return;
      }

      if (!data) {
        console.log('Aucune donnée trouvée - nouveau compte');
        setUserData({
          email: session.user.email || '',
          phone: '',
          first_name: '',
          last_name: '',
          birth_date: '',
          address: '',
          company_name: '',
          contact_name: '',
          siret_or_id: '',
        });
        setLoading(false);
        return;
      }

      const mergedData: any = {
        email: session.user.email || data.email || '',
        phone: data.phone || '',
        birth_date: data.birth_date || '',
        address: data.address || '',
        first_name: '',
        last_name: '',
        company_name: '',
        contact_name: '',
        siret_or_id: '',
      };

      if (data.role === 'customer') {
        const customerProfile = Array.isArray(data.customer_profiles) ? data.customer_profiles[0] : data.customer_profiles;
        const fullName = customerProfile?.full_name || '';
        const [firstName, lastName] = fullName.split(' ');
        mergedData.first_name = firstName || '';
        mergedData.last_name = lastName || '';
        console.log('Customer data fusionné:', { firstName, lastName, fullName });
      }

      if (isCompanyRole(data.role)) {
        const companyProfile = Array.isArray(data.company_profiles) ? data.company_profiles[0] : data.company_profiles;
        mergedData.company_name = companyProfile?.company_name || '';
        mergedData.contact_name = companyProfile?.contact_name || '';
        mergedData.siret_or_id = companyProfile?.siret_or_id || '';
        console.log('Company data fusionné:', mergedData);
      }

      console.log('Objet userData final:', mergedData);
      setUserData(mergedData);
      setProfileRole(data?.role || null);
    } catch (e) {
      console.error('Error loading data:', e);
    }
    setLoading(false);
  };

  const handleUpdateProfile = async () => {
    if (!session?.user) return;

    try {
      console.log('Sauvegarde pour user ID:', session.user.id);
      console.log('Données à sauvegarder:', userData);

      if (profileRole === 'customer') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            phone: userData.phone || '',
            birth_date: userData.birth_date || null,
            address: userData.address || '',
          })
          .eq('id', session.user.id);

        if (profileError) {
          console.error('Erreur update profiles:', profileError);
          setSaveMessage('Erreur lors de la sauvegarde');
          setTimeout(() => setSaveMessage(null), 3000);
          return;
        }

        const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        const { error: customerError } = await supabase
          .from('customer_profiles')
          .update({
            full_name: fullName,
          })
          .eq('id', session.user.id);

        if (customerError) {
          console.error('Erreur update customer_profiles:', customerError);
          setSaveMessage('Erreur lors de la sauvegarde');
          setTimeout(() => setSaveMessage(null), 3000);
          return;
        }
      }

      if (isCompanyRole(profileRole)) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            phone: userData.phone || '',
            address: userData.address || '',
          })
          .eq('id', session.user.id);

        if (profileError) {
          console.error('Erreur update profiles:', profileError);
          setSaveMessage('Erreur lors de la sauvegarde');
          setTimeout(() => setSaveMessage(null), 3000);
          return;
        }

        const { error: companyError } = await supabase
          .from('company_profiles')
          .update({
            company_name: userData.company_name,
            contact_name: userData.contact_name,
            siret_or_id: userData.siret_or_id,
          })
          .eq('user_id', session.user.id);

        if (companyError) {
          console.error('Erreur update company_profiles:', companyError);
          setSaveMessage('Erreur lors de la sauvegarde');
          setTimeout(() => setSaveMessage(null), 3000);
          return;
        }
      }

      setSaveMessage('Modifications enregistrées !');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (e) {
      console.error('Error updating profile:', e);
      setSaveMessage('Erreur lors de la sauvegarde');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerLogo}>gali<Text style={styles.headerLogoAccent}>'</Text>pet</Text>
          <View style={styles.headerRightIcons}>
            <Text style={styles.headerIcon}>💬</Text>
            <Text style={styles.headerIcon}>📅</Text>
            <Text style={styles.headerIcon}>🔔</Text>
          </View>
        </View>

        {/* PROFILE SECTION */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarIcon}>👤</Text>
            </View>
            <View style={styles.cameraBtn}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </View>
          <Text style={styles.userName}>
            {isCompanyRole(profileRole) ? userData.company_name : `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Utilisateur'}
          </Text>
        </View>

        {/* PERSONAL INFO CARD */}
        <View style={styles.infoCard}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitleIcon}>👤</Text>
            <Text style={styles.cardTitle}>Informations personnelles</Text>
          </View>
          <Pressable 
            style={styles.editBtn} 
            onPress={() => {
              if (isEditing) {
                handleUpdateProfile();
              }
              setIsEditing(!isEditing);
            }}
          >
            <Text style={styles.editIcon}>{isEditing ? '💾' : '✏️'}</Text>
          </Pressable>
        </View>

        {/* SAVE MESSAGE */}
        {saveMessage && (
          <View style={styles.saveMessageContainer}>
            <Text style={styles.saveMessageText}>{saveMessage}</Text>
          </View>
        )}

        {/* INFO FIELDS */}
        <View style={styles.infoCard}>
          {console.log('Rendu - userData:', userData)}
          {profileRole === 'customer' && CUSTOMER_FIELDS.map((field) => (
            <View key={field.key} style={styles.infoRow}>
              <Text style={styles.infoIcon}>{field.icon}</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{field.label}</Text>
                <TextInput
                  style={[styles.infoValue, !isEditing && styles.infoValueDisabled]}
                  value={userData[field.key] || ''}
                  editable={isEditing}
                  onChangeText={(text) => setUserData({ ...userData, [field.key]: text })}
                />
              </View>
            </View>
          ))}

          {isCompanyRole(profileRole) && COMPANY_FIELDS.map((field) => (
            <View key={field.key} style={styles.infoRow}>
              <Text style={styles.infoIcon}>{field.icon}</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{field.label}</Text>
                <TextInput
                  style={[styles.infoValue, !isEditing && styles.infoValueDisabled]}
                  value={userData[field.key] || ''}
                  editable={isEditing}
                  onChangeText={(text) => setUserData({ ...userData, [field.key]: text })}
                />
              </View>
            </View>
          ))}

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>✉️</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValueDisabled}>{userData.email}</Text>
            </View>
          </View>
        </View>

        {/* LOGOUT */}
        <Pressable style={styles.logoutBtn} onPress={() => supabase?.auth?.signOut()}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  
  // HEADER
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#E87A5D', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16,
  },
  headerLogo: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  headerLogoAccent: { color: '#FFF' },
  headerRightIcons: { flexDirection: 'row', gap: 12 },
  headerIcon: { fontSize: 20 },
  
  // PROFILE SECTION
  profileSection: { alignItems: 'center', paddingVertical: 20, backgroundColor: '#F5F7FA' },
  avatarContainer: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#A0A0A0', alignItems: 'center', justifyContent: 'center' },
  avatarIcon: { fontSize: 40, color: '#FFF' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: '#E87A5D', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  cameraIcon: { fontSize: 14 },
  userName: { fontSize: 22, fontWeight: '700', color: '#2E2A26', marginTop: 12 },
  
  // INFO CARD
  infoCard: { backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 16 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#2E2A26' },
  cardTitleIcon: { fontSize: 18 },
  editBtn: { position: 'absolute', top: 16, right: 16 },
  editIcon: { fontSize: 18 },
  
  // INFO FIELDS
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  infoIcon: { fontSize: 18, width: 24 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#6B6660', marginBottom: 4 },
  infoValue: { fontSize: 16, color: '#2E2A26', fontWeight: '500', borderBottomWidth: 1, borderBottomColor: '#EADBC8', paddingBottom: 4 },
  infoValueDisabled: { fontSize: 16, color: '#2E2A26', fontWeight: '500' },
  
  // SAVE MESSAGE
  saveMessageContainer: { backgroundColor: '#27AE60', marginHorizontal: 16, marginTop: 8, borderRadius: 8, padding: 12, alignItems: 'center' },
  saveMessageText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  
  // LOGOUT
  logoutBtn: { backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 24, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#C0392B' },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#C0392B' },
  
  bottomSpacer: { height: 120 },
});
