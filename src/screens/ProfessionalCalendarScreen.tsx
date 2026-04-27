import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions, ActivityIndicator, Modal, TextInput, Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from '../components/Icon';
import { getSupabase } from '../lib/supabase';
import { colors, radius, spacing } from '../theme/colors';

const { width } = Dimensions.get('window');

interface Booking {
  id: string;
  customer_profile_id: string;
  company_profile_id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  amount_cents: number;
}

type ViewMode = 'Jour' | 'Semaine' | 'Mois';

const STATUS_LEGEND = [
  { label: 'En attente', color: '#F4C28F' },
  { label: 'Nouveau créneau', color: '#B0C4DE' },
  { label: 'En attente paiement', color: '#7B7BFF' },
  { label: 'Confirmé', color: '#4CD964' },
  { label: 'Terminé', color: '#2E8B57' },
  { label: 'Avis soumis', color: '#DA70D6' },
  { label: 'Supplément', color: '#FF8C00' },
  { label: 'Refusé', color: '#FF3B30' },
  { label: 'Client absent', color: '#8B0000' },
  { label: 'Créneau personnel', color: '#708090' },
];

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const DAY_NAMES_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const DAY_NAMES_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function ProfessionalCalendarScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('Semaine');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startHour, setStartHour] = useState('09');
  const [startMin, setStartMin] = useState('00');
  const [endHour, setEndHour] = useState('10');
  const [endMin, setEndMin] = useState('00');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCompanyAndBookings();
  }, [currentDate, viewMode]);

  const loadCompanyAndBookings = async () => {
    try {
      setLoading(true);
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Récupérer le company_profile via profiles (comme ProfileScreen)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_profiles(id)')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Erreur fetching profile:', profileError);
      }

      let companyIdLocal: string | null = null;

      if (profileData && (profileData as any).company_profiles) {
        const cp = (profileData as any).company_profiles;
        companyIdLocal = Array.isArray(cp) ? cp[0]?.id : cp?.id;
      }

      // Fallback : essayer directement sur company_profiles
      if (!companyIdLocal) {
        const { data: company } = await supabase
          .from('company_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (company) companyIdLocal = company.id;
      }

      if (!companyIdLocal) {
        console.warn('Aucun company_profile trouvé pour user', user.id);
        setLoading(false);
        return;
      }

      setCompanyId(companyIdLocal);

      const { start, end } = getDateRange();
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('company_profile_id', companyIdLocal)
        .gte('starts_at', start.toISOString())
        .lte('starts_at', end.toISOString())
        .order('starts_at', { ascending: true });

      if (error) throw error;
      setBookings(bookingsData || []);
    } catch (err) {
      console.error('Error fetching calendar bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    if (viewMode === 'Jour') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (viewMode === 'Semaine') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(start.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    }
    return { start, end };
  };

  const goPrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'Jour') d.setDate(d.getDate() - 1);
    else if (viewMode === 'Semaine') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const goNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'Jour') d.setDate(d.getDate() + 1);
    else if (viewMode === 'Semaine') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const formatHeaderDate = () => {
    if (viewMode === 'Jour') {
      return `${DAY_NAMES_FULL[currentDate.getDay()]} ${currentDate.getDate()} ${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (viewMode === 'Semaine') {
      const { start, end } = getDateRange();
      return `${start.getDate()} ${MONTH_NAMES[start.getMonth()].substring(0, 3)}. - ${end.getDate()} ${MONTH_NAMES[end.getMonth()].substring(0, 3)}. ${end.getFullYear()}`;
    } else {
      return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F4C28F';
      case 'confirmed': return '#4CD964';
      case 'completed': return '#2E8B57';
      case 'cancelled': return '#FF3B30';
      case 'no_show': return '#8B0000';
      case 'personal_slot': return '#708090';
      default: return '#B0C4DE';
    }
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(b => {
      const d = new Date(b.starts_at);
      return d.getDate() === date.getDate() &&
             d.getMonth() === date.getMonth() &&
             d.getFullYear() === date.getFullYear();
    });
  };

  const openModal = () => {
    const today = new Date();
    const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    setStartDate(fmt(today));
    setEndDate(fmt(today));
    setStartHour('09');
    setStartMin('00');
    setEndHour('10');
    setEndMin('00');
    setReason('');
    setNotes('');
    setShowModal(true);
  };

  const parseDate = (str: string) => {
    const [day, month, year] = str.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const handleSaveSlot = async () => {
    if (!reason.trim()) { Alert.alert('Champ requis', 'Veuillez indiquer une raison.'); return; }
    if (!companyId) { Alert.alert('Erreur', 'Impossible de récupérer votre entreprise.'); return; }

    try {
      setSaving(true);
      const sDate = parseDate(startDate);
      const eDate = parseDate(endDate);
      const [sh, sm] = [parseInt(startHour), parseInt(startMin)];
      const [eh, em] = [parseInt(endHour), parseInt(endMin)];

      sDate.setHours(sh, sm, 0, 0);
      eDate.setHours(eh, em, 0, 0);

      if (eDate <= sDate) { Alert.alert('Erreur', 'La date de fin doit être après la date de début.'); return; }

      const supabase = getSupabase();
      const { error } = await supabase.from('bookings').insert({
        company_profile_id: companyId,
        customer_profile_id: null,
        starts_at: sDate.toISOString(),
        ends_at: eDate.toISOString(),
        status: 'personal_slot',
        amount_cents: 0,
        currency: 'EUR',
        notes: notes.trim() || null,
        reason: reason.trim(),
      });

      if (error) throw error;

      setShowModal(false);
      loadCompanyAndBookings();
      Alert.alert('Créneau réservé', 'Votre créneau personnel a été ajouté au calendrier.');
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de sauvegarder le créneau.');
    } finally {
      setSaving(false);
    }
  };

  const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const MINUTES = ['00', '15', '30', '45'];

  const renderTimePicker = (value: string, setValue: (v: string) => void, options: string[]) => (
    <View style={styles.pickerBox}>
      <Picker
        selectedValue={value}
        onValueChange={(itemValue) => setValue(itemValue)}
        style={styles.picker}
        itemStyle={styles.pickerItem}
      >
        {options.map((opt) => (
          <Picker.Item key={opt} label={opt} value={opt} />
        ))}
      </Picker>
    </View>
  );
  const renderLegend = () => (
    <View style={styles.legendWrap}>
      <View style={styles.legendGrid}>
        {STATUS_LEGEND.map((item, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderDayView = () => {
    const startHour = 6;
    const endHour = 21;
    const slotHeight = 50;
    const slotsCount = (endHour - startHour) * 2;
    const dayBookings = getBookingsForDate(currentDate);

    return (
      <ScrollView style={styles.dayScroll} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row' }}>
          {/* Colonne heures */}
          <View style={{ width: 50 }}>
            {Array.from({ length: slotsCount }, (_, i) => {
              const h = startHour + Math.floor(i / 2);
              const m = (i % 2) * 30;
              return (
                <View key={i} style={[styles.dayRow, { height: slotHeight, borderBottomWidth: 1, borderBottomColor: '#EFEFEF' }]}>
                  <Text style={styles.dayTime}>{String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}</Text>
                </View>
              );
            })}
          </View>

          {/* Colonne événements */}
          <View style={{ flex: 1, position: 'relative' }}>
            {Array.from({ length: slotsCount }, (_, i) => (
              <View key={i} style={{ height: slotHeight, borderBottomWidth: 1, borderBottomColor: '#EFEFEF' }} />
            ))}

            {dayBookings.map((b, idx) => {
              const start = new Date(b.starts_at);
              const end = new Date(b.ends_at);
              const startMin = (start.getHours() - startHour) * 60 + start.getMinutes();
              const durationMin = (end.getTime() - start.getTime()) / 60000;
              const top = (startMin / 30) * slotHeight;
              const height = (durationMin / 30) * slotHeight;

              return (
                <View
                  key={idx}
                  style={[
                    styles.dayBooking,
                    {
                      position: 'absolute',
                      top,
                      left: 4,
                      right: 4,
                      height: Math.max(height, 24),
                      backgroundColor: getStatusColor(b.status) + '25',
                      borderLeftColor: getStatusColor(b.status),
                      borderLeftWidth: 3,
                      borderRadius: 6,
                      padding: 4,
                    },
                  ]}
                >
                  <Text style={[styles.dayBookingText, { color: getStatusColor(b.status), fontSize: 11 }]} numberOfLines={1}>
                    {b.reason || (b.amount_cents > 0 ? `${(b.amount_cents / 100).toFixed(2)}€` : 'Créneau')}
                  </Text>
                  <Text style={{ fontSize: 9, color: getStatusColor(b.status), opacity: 0.8 }}>
                    {String(start.getHours()).padStart(2, '0')}:{String(start.getMinutes()).padStart(2, '0')} - {String(end.getHours()).padStart(2, '0')}:{String(end.getMinutes()).padStart(2, '0')}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderWeekView = () => {
    const { start } = getDateRange();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    const startHour = 6;
    const endHour = 21;
    const slotHeight = 50;
    const slotsCount = (endHour - startHour) * 2;

    return (
      <ScrollView style={styles.weekScroll} showsVerticalScrollIndicator={false}>
        {/* Header jours */}
        <View style={[styles.weekHeaderRow, { paddingLeft: 50 }]}>
          {days.map((d, i) => {
            const isToday = new Date().toDateString() === d.toDateString();
            return (
              <View key={i} style={[styles.weekDayHeader, { flex: 1 }]}>
                <Text style={[styles.weekDayName, isToday && styles.weekDayNameToday]}>{DAY_NAMES_SHORT[i]}</Text>
                <Text style={[styles.weekDayNum, isToday && styles.weekDayNumToday]}>{d.getDate()}</Text>
              </View>
            );
          })}
        </View>

        {/* Grille */}
        <View style={{ flexDirection: 'row' }}>
          {/* Colonne heures */}
          <View style={{ width: 50 }}>
            {Array.from({ length: slotsCount }, (_, i) => {
              const h = startHour + Math.floor(i / 2);
              const m = (i % 2) * 30;
              return (
                <View key={i} style={{ height: slotHeight, justifyContent: 'flex-start', paddingTop: 2, borderBottomWidth: 1, borderBottomColor: '#EFEFEF' }}>
                  <Text style={{ fontSize: 10, color: '#8E8E93', textAlign: 'center' }}>{String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}</Text>
                </View>
              );
            })}
          </View>

          {/* Colonnes jours avec événements */}
          {days.map((d, dayIdx) => {
            const dayBookings = getBookingsForDate(d);
            return (
              <View key={dayIdx} style={{ flex: 1, position: 'relative', borderLeftWidth: 1, borderLeftColor: '#EFEFEF' }}>
                {/* Lignes de grille */}
                {Array.from({ length: slotsCount }, (_, i) => (
                  <View key={i} style={{ height: slotHeight, borderBottomWidth: 1, borderBottomColor: '#EFEFEF' }} />
                ))}

                {/* Événements positionnés */}
                {dayBookings.map((b, idx) => {
                  const start = new Date(b.starts_at);
                  const end = new Date(b.ends_at);
                  const startMin = (start.getHours() - startHour) * 60 + start.getMinutes();
                  const durationMin = (end.getTime() - start.getTime()) / 60000;
                  const top = (startMin / 30) * slotHeight;
                  const height = (durationMin / 30) * slotHeight;

                  return (
                    <View
                      key={idx}
                      style={{
                        position: 'absolute',
                        top,
                        left: 2,
                        right: 2,
                        height: Math.max(height, 20),
                        backgroundColor: getStatusColor(b.status) + '25',
                        borderLeftColor: getStatusColor(b.status),
                        borderLeftWidth: 3,
                        borderRadius: 4,
                        padding: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <Text style={{ fontSize: 9, color: getStatusColor(b.status), fontWeight: '600' }} numberOfLines={1}>
                        {b.reason || (b.amount_cents > 0 ? `${(b.amount_cents / 100).toFixed(0)}€` : 'Créneau')}
                      </Text>
                      <Text style={{ fontSize: 8, color: getStatusColor(b.status), opacity: 0.8 }}>
                        {String(start.getHours()).padStart(2, '0')}:{String(start.getMinutes()).padStart(2, '0')}
                      </Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));

    return (
      <View style={styles.monthWrap}>
        <View style={styles.monthHeader}>
          {DAY_NAMES_SHORT.map((d, i) => (
            <Text key={i} style={styles.monthDayHeader}>{d}</Text>
          ))}
        </View>
        <View style={styles.monthGrid}>
          {days.map((d, i) => {
            if (!d) return <View key={i} style={styles.monthCellEmpty} />;
            const isToday = new Date().toDateString() === d.toDateString();
            const dayBookings = getBookingsForDate(d);
            return (
              <TouchableOpacity key={i} style={[styles.monthCell, isToday && styles.monthCellToday]} onPress={() => { setCurrentDate(d); setViewMode('Jour'); }}>
                <Text style={[styles.monthCellNum, isToday && styles.monthCellNumToday]}>{d.getDate()}</Text>
                {dayBookings.length > 0 && (
                  <View style={styles.monthDots}>
                    {dayBookings.slice(0, 3).map((b, idx) => (
                      <View key={idx} style={[styles.monthDot, { backgroundColor: getStatusColor(b.status) }]} />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER ORANGE */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.headerIconCircle}>
            <Icon name="time-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerLogo}>gali<Text style={styles.headerLogoAccent}>'</Text>pet</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Icon name="chatbubble-ellipses-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Icon name="notifications-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerTitle}>Mon Calendrier</Text>

        {/* Bouton réserver */}
        <TouchableOpacity style={styles.reserveBtn} onPress={openModal}>
          <Icon name="ban" size={16} color={colors.textMuted} />
          <Text style={styles.reserveText}>Se réserver un créneau</Text>
        </TouchableOpacity>

        {/* TOGGLE */}
        <View style={styles.toggleWrap}>
          <View style={styles.toggleContainer}>
            {(['Jour', 'Semaine', 'Mois'] as ViewMode[]).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setViewMode(p)}
                style={[styles.toggleBtn, viewMode === p && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleText, viewMode === p && styles.toggleTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* NAVIGATION DATE */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={goPrev} style={styles.dateNavBtn}>
          <Icon name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.dateNavText}>{formatHeaderDate()}</Text>
        <TouchableOpacity onPress={goNext} style={styles.dateNavBtn}>
          <Icon name="chevron-forward" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* LEGENDE */}
      {renderLegend()}

      {/* CONTENT */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.content}>
          {viewMode === 'Jour' && renderDayView()}
          {viewMode === 'Semaine' && renderWeekView()}
          {viewMode === 'Mois' && renderMonthView()}
        </View>
      )}

      {/* MODAL RÉSERVER CRÉNEAU */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Se réserver un créneau</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Raison</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="ex: Vacances"
                value={reason}
                onChangeText={setReason}
              />

              {/* Dates */}
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.modalLabel}>Date début</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="JJ/MM/AAAA"
                    value={startDate}
                    onChangeText={setStartDate}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.modalLabel}>Date fin</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="JJ/MM/AAAA"
                    value={endDate}
                    onChangeText={setEndDate}
                  />
                </View>
              </View>

              {/* Heure début */}
              <Text style={styles.modalLabel}>Heure début</Text>
              <View style={styles.timeRow}>
                {renderTimePicker(startHour, setStartHour, HOURS)}
                <Text style={styles.timeSep}>:</Text>
                {renderTimePicker(startMin, setStartMin, MINUTES)}
              </View>

              {/* Heure fin */}
              <Text style={styles.modalLabel}>Heure fin</Text>
              <View style={styles.timeRow}>
                {renderTimePicker(endHour, setEndHour, HOURS)}
                <Text style={styles.timeSep}>:</Text>
                {renderTimePicker(endMin, setEndMin, MINUTES)}
              </View>

              <Text style={styles.modalLabel}>Notes (optionnel)</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Notes supplémentaires..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalSaveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSaveSlot}
              disabled={saving}
            >
              <Text style={styles.modalSaveText}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },

  // HEADER
  header: {
    backgroundColor: '#E87A5D',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerLogo: { fontSize: 22, fontWeight: '700', color: '#fff', fontStyle: 'italic' },
  headerLogoAccent: { color: '#fff' },
  headerRight: { flexDirection: 'row', gap: 12 },
  headerIconBtn: { padding: 4 },
  headerTitle: {
    color: '#fff', fontSize: 18, fontWeight: '700',
    marginTop: 12, marginBottom: 12,
  },
  reserveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderRadius: radius.pill,
    paddingVertical: 10, gap: 8,
  },
  reserveText: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },

  // TOGGLE
  toggleWrap: { marginTop: 12 },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: radius.pill,
    padding: 4,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 8,
    alignItems: 'center', borderRadius: radius.pill,
  },
  toggleBtnActive: { backgroundColor: '#fff' },
  toggleText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: 13 },
  toggleTextActive: { color: '#E87A5D' },

  // DATE NAV
  dateNav: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dateNavBtn: { padding: 4 },
  dateNavText: { fontSize: 15, fontWeight: '600', color: colors.text },

  // LEGEND
  legendWrap: {
    backgroundColor: '#fff',
    paddingHorizontal: 12, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#EFEFEF',
  },
  legendGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 8,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: 10, color: colors.textMuted },

  // DAY VIEW
  dayScroll: { flex: 1, paddingHorizontal: 16 },
  dayRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderBottomWidth: 1, borderBottomColor: '#EFEFEF',
    paddingVertical: 8, minHeight: 44,
  },
  dayTime: { width: 45, fontSize: 12, color: '#8E8E93', marginTop: 2 },
  daySlot: { flex: 1, flexDirection: 'column', gap: 4 },
  dayEmpty: { fontSize: 13, color: '#C7C7CC' },
  dayBooking: {
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
    borderLeftWidth: 3,
  },
  dayBookingText: { fontSize: 12, fontWeight: '600' },

  // WEEK VIEW
  weekScroll: { flex: 1 },
  weekHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: '#EFEFEF',
    backgroundColor: '#fff',
  },
  weekCorner: { width: 45 },
  weekDayHeader: {
    flex: 1, alignItems: 'center', paddingVertical: 6,
  },
  weekDayName: { fontSize: 11, color: colors.textMuted },
  weekDayNameToday: { color: '#FF3B30', fontWeight: '700' },
  weekDayNum: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 2 },
  weekDayNumToday: { color: '#FF3B30' },
  weekRow: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: '#EFEFEF',
    minHeight: 50,
  },
  weekHour: {
    width: 45, fontSize: 11, color: '#8E8E93',
    paddingTop: 4, textAlign: 'center',
  },
  weekCell: {
    flex: 1, borderLeftWidth: 1, borderLeftColor: '#EFEFEF',
    padding: 2, flexDirection: 'row', flexWrap: 'wrap', gap: 2,
  },
  weekBookingDot: { width: 8, height: 8, borderRadius: 4 },

  // MONTH VIEW
  monthWrap: { flex: 1, paddingHorizontal: 12, paddingTop: 8 },
  monthHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  monthDayHeader: {
    flex: 1, textAlign: 'center',
    fontSize: 12, fontWeight: '600', color: colors.textMuted,
  },
  monthGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
  },
  monthCellEmpty: {
    width: (width - 24) / 7, height: (width - 24) / 7 + 6,
  },
  monthCell: {
    width: (width - 24) / 7, height: (width - 24) / 7 + 6,
    borderWidth: 1, borderColor: '#EFEFEF',
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 6,
  },
  monthCellToday: {
    borderColor: '#E87A5D', borderWidth: 2,
  },
  monthCellNum: { fontSize: 14, color: colors.text },
  monthCellNumToday: { color: '#E87A5D', fontWeight: '700' },
  monthDots: {
    flexDirection: 'row', gap: 2, marginTop: 4,
  },
  monthDot: { width: 6, height: 6, borderRadius: 3 },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 12,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#FAFAFA',
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeSep: { fontSize: 16, fontWeight: '700', color: colors.text },
  pickerBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
    height: 48,
    justifyContent: 'center',
  },
  picker: {
    height: 48,
    width: '100%',
  },
  pickerItem: {
    fontSize: 15,
    color: colors.text,
  },
  modalSaveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  modalSaveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
