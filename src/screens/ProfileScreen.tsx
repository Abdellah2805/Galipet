import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, TextInput } from 'react-native';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing } from '../theme/colors';

const INFO_FIELDS = [
  { key: 'first_name', label: 'Prénom', icon: '👤', editable: true },
  { key: 'last_name', label: 'Nom', icon: '👤', editable: true },
  { key: 'birth_date', label: 'Date de naissance', icon: '📅', editable: true },
  { key: 'email', label: 'Email', icon: '✉️', editable: false },
  { key: 'phone', label: 'Téléphone', icon: '📱', editable: true },
  { key: 'address', label: 'Adresse', icon: '📍', editable: true },
];

const COMPANY_FIELDS = [
  { key: 'company_name', label: 'Nom de l\'entreprise', icon: '🏢' },
  { key: 'siret', label: 'SIRET', icon: '🔢' },
  { key: 'description', label: 'Description', icon: '📝' },
];

export default function ProfileScreen({ navigation, onNavigate }: any) {
  const { session, userRole } = useAuth();
  const supabase = getSupabase();
  const navigateFn = onNavigate || navigation?.navigate || (() => {});
  const [userData, setUserData] = useState<any>({
    first_name: 'jean',
    last_name: 'dupont',
    birth_date: '10 mars 1988',
    email: session?.user?.email || 'jean@example.com',
    phone: '+212 6XX XXX XXX',
    address: 'Cergy',
  });
  const [companyData, setCompanyData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [session]);

  const loadUserData = async () => {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setUserData({
          first_name: data.first_name || 'jean',
          last_name: data.last_name || 'dupont',
          birth_date: data.birth_date || '10 mars 1988',
          email: session.user.email || data.email || 'jean@example.com',
          phone: data.phone || '+212 6XX XXX XXX',
          address: data.address || 'Cergy',
        });
      }

      if (userRole === 'company') {
        const { data: compData } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (compData) {
          setCompanyData({
            company_name: compData.company_name || '',
            siret: compData.siret_or_id || '',
            description: compData.description || '',
          });
        }
      }
    } catch (e) {
      console.log('Error loading data:', e);
    }
    setLoading(false);
  };

  const InfoRow = ({ field, value }: { field: any; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{field.icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{field.label}</Text>
        <TextInput
          style={[styles.infoValue, !field.editable && styles.infoValueDisabled]}
          value={value}
          editable={field.editable && isEditing}
          onChangeText={(text) => setUserData({ ...userData, [field.key]: text })}
        />
      </View>
    </View>
  );

  const CompanyRow = ({ field, value }: { field: any; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{field.icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{field.label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

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
            {userData.first_name} {userData.last_name}
          </Text>
        </View>

        {/* PERSONAL INFO CARD */}
        <View style={styles.infoCard}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitleIcon}>👤</Text>
            <Text style={styles.cardTitle}>Informations personnelles</Text>
          </View>
          <Pressable style={styles.editBtn} onPress={() => setIsEditing(!isEditing)}>
            <Text style={styles.editIcon}>{isEditing ? '💾' : '✏️'}</Text>
          </Pressable>
        </View>

        {/* INFO FIELDS */}
        <View style={styles.infoCard}>
          <View style={styles.infoGrid}>
            <View style={styles.infoGridItem}>
              <Text style={styles.infoLabel}>Prénom</Text>
              <TextInput
                style={styles.infoValue}
                value={userData.first_name}
                editable={isEditing}
                onChangeText={(text) => setUserData({ ...userData, first_name: text })}
              />
            </View>
            <View style={styles.infoGridItem}>
              <Text style={styles.infoLabel}>Nom</Text>
              <TextInput
                style={styles.infoValue}
                value={userData.last_name}
                editable={isEditing}
                onChangeText={(text) => setUserData({ ...userData, last_name: text })}
              />
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date de naissance</Text>
              <TextInput
                style={styles.infoValue}
                value={userData.birth_date}
                editable={isEditing}
                onChangeText={(text) => setUserData({ ...userData, birth_date: text })}
              />
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>✉️</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValueDisabled}>{userData.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📱</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <TextInput
                style={styles.infoValue}
                value={userData.phone}
                editable={isEditing}
                onChangeText={(text) => setUserData({ ...userData, phone: text })}
              />
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Adresse</Text>
              <TextInput
                style={styles.infoValue}
                value={userData.address}
                editable={isEditing}
                onChangeText={(text) => setUserData({ ...userData, address: text })}
              />
            </View>
          </View>
        </View>

        {/* COMPANY INFO (if company) */}
        {userRole === 'company' && (
          <>
            <View style={[styles.infoCard, styles.cardTitleRow]}>
              <Text style={styles.cardTitleIcon}>🏢</Text>
              <Text style={styles.cardTitle}>Informations entreprise</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🏢</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Nom de l'entreprise</Text>
                  <Text style={styles.infoValue}>{companyData.company_name || 'Non défini'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🔢</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>SIRET</Text>
                  <Text style={styles.infoValue}>{companyData.siret || 'Non défini'}</Text>
                </View>
              </View>
            </View>
          </>
        )}

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
  infoGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  infoGridItem: { flex: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  infoIcon: { fontSize: 18, width: 24 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#6B6660', marginBottom: 4 },
  infoValue: { fontSize: 16, color: '#2E2A26', fontWeight: '500', borderBottomWidth: 1, borderBottomColor: '#EADBC8', paddingBottom: 4 },
  infoValueDisabled: { fontSize: 16, color: '#2E2A26', fontWeight: '500' },
  
  // LOGOUT
  logoutBtn: { backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 24, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#C0392B' },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#C0392B' },
  
  bottomSpacer: { height: 120 },
});