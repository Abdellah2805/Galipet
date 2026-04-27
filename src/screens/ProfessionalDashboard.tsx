import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
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
  currency: string;
  amount_cents: number;
  status: string;
}

const PERIOD_LABELS: Record<string, string> = {
  Jour: 'Jour',
  Semaine: 'Semaine',
  Mois: 'Mois',
};

export default function ProfessionalDashboard() {
  const [period, setPeriod] = useState('Semaine');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [period]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: company } = await supabase
        .from('company_profiles')
        .select('id, company_name')
        .eq('user_id', user.id)
        .single();

      if (!company) { setLoading(false); return; }
      setCompanyName(company.company_name || '');

      const now = new Date();
      let startDate: Date;
      switch (period) {
        case 'Jour':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'Mois':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      }

      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('company_profile_id', company.id)
        .gte('starts_at', startDate.toISOString())
        .order('starts_at', { ascending: false });

      if (error) throw error;
      setBookings(bookingsData || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateKPIs = () => {
    const totalRevenueCents = bookings
      .filter(b => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.amount_cents || 0), 0);
    const totalRevenue = (totalRevenueCents / 100).toFixed(2);
    const totalBookings = bookings.length;
    const uniqueClients = new Set(bookings.map(b => b.customer_profile_id)).size;

    const totalMinutes = bookings.reduce((sum, b) => {
      const start = new Date(b.starts_at);
      const end = new Date(b.ends_at);
      return sum + Math.max(0, end.getTime() - start.getTime()) / 60000;
    }, 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);
    const hoursFormatted = `${hours}h${mins > 0 ? String(mins).padStart(2, '0') : ''}`;

    return [
      { label: 'Revenus totaux', value: `${totalRevenue}€`, sub: 'Période courante', icon: 'cash-outline', color: '#E8A838' },
      { label: 'Réservations', value: String(totalBookings), sub: 'Période courante', icon: 'calendar-outline', color: '#E87A5D' },
      { label: 'Clients actifs', value: String(uniqueClients), sub: 'Période courante', icon: 'people-outline', color: '#7BA988' },
      { label: 'Heures travaillées', value: hoursFormatted, sub: 'Période courante', icon: 'time-outline', color: '#6B6660' },
    ];
  };

  const getTrendData = () => {
    const data: { label: string; value: number }[] = [];

    if (period === 'Jour') {
      const slots = ['00', '06', '09', '12', '15', '18', '21'];
      slots.forEach(h => {
        const hNum = parseInt(h, 10);
        const sum = bookings
          .filter(b => {
            const d = new Date(b.starts_at);
            return d.getHours() >= hNum && d.getHours() < hNum + 3;
          })
          .reduce((s, b) => s + (b.amount_cents || 0) / 100, 0);
        data.push({ label: `${h}h`, value: sum });
      });
    } else if (period === 'Mois') {
      for (let w = 1; w <= 4; w++) {
        const sum = bookings
          .filter(b => {
            const d = new Date(b.starts_at);
            const week = Math.ceil(d.getDate() / 7);
            return week === w;
          })
          .reduce((s, b) => s + (b.amount_cents || 0) / 100, 0);
        data.push({ label: `Sem ${w}`, value: sum });
      }
    } else {
      const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      days.forEach((day, idx) => {
        const sum = bookings
          .filter(b => {
            const d = new Date(b.starts_at);
            return d.getDay() === (idx + 1) % 7;
          })
          .reduce((s, b) => s + (b.amount_cents || 0) / 100, 0);
        data.push({ label: day, value: sum });
      });
    }
    return data;
  };

  const kpis = calculateKPIs();
  const trendData = getTrendData();
  const maxTrend = Math.max(...trendData.map(d => d.value), 1);

  return (
    <View style={styles.container}>
      {/* HEADER ORANGE */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerIconCircle}>
            <Icon name="person-outline" size={20} color="#fff" />
          </View>
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
        <Text style={styles.headerWelcome}>Bonjour {companyName || 'pro'} !</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* TOGGLE JOUR/SEMAINE/MOIS */}
          <View style={styles.toggleWrap}>
            <View style={styles.toggleContainer}>
              {['Jour', 'Semaine', 'Mois'].map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPeriod(p)}
                  style={[styles.toggleBtn, period === p && styles.toggleBtnActive]}
                >
                  <Text style={[styles.toggleText, period === p && styles.toggleTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* KPI CARDS 2x2 */}
          <View style={styles.kpiGrid}>
            {kpis.map((kpi, i) => (
              <View key={i} style={styles.kpiCard}>
                <View style={styles.kpiTopRow}>
                  <View style={[styles.kpiIconWrap, { backgroundColor: kpi.color + '15' }]}>
                    <Icon name={kpi.icon as any} size={20} color={kpi.color} />
                  </View>
                  <View style={styles.kpiMiniLine} />
                </View>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
                <Text style={styles.kpiValue}>{kpi.value}</Text>
                <Text style={styles.kpiSub}>{kpi.sub}</Text>
              </View>
            ))}
          </View>

          {/* TENDANCE DES REVENUS */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Tendance des revenus - {PERIOD_LABELS[period]}</Text>
              <Icon name="trending-up-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.chartWrap}>
              <View style={styles.chartYAxis}>
                {['€4', '€3', '€2', '€1', '€0'].map((l, i) => (
                  <Text key={i} style={styles.chartYLabel}>{l}</Text>
                ))}
              </View>
              <View style={styles.chartBody}>
                <View style={styles.chartLine} />
                {/* Connecting lines between dots */}
                <View style={styles.chartLinesRow}>
                  {trendData.map((d, i) => {
                    if (i === trendData.length - 1) return null;
                    const next = trendData[i + 1];
                    const y1 = 100 - (d.value / maxTrend) * 80;
                    const y2 = 100 - (next.value / maxTrend) * 80;
                    const segmentWidth = (width - 108) / trendData.length;
                    const left = segmentWidth * (i + 0.5);
                    const height = Math.abs(y2 - y1);
                    const top = Math.min(y1, y2);
                    const angle = Math.atan2(y2 - y1, segmentWidth) * (180 / Math.PI);
                    return (
                      <View
                        key={i}
                        style={{
                          position: 'absolute',
                          left,
                          top: top + 4,
                          width: Math.sqrt(segmentWidth * segmentWidth + (y2 - y1) * (y2 - y1)),
                          height: 2,
                          backgroundColor: '#E87A5D',
                          transform: [{ rotateZ: `${angle}deg` }],
                          transformOrigin: 'left center',
                        }}
                      />
                    );
                  })}
                </View>
                <View style={styles.chartDotsRow}>
                  {trendData.map((d, i) => (
                    <View key={i} style={styles.chartDotCol}>
                      <View style={styles.chartDotWrap}>
                        <View style={[styles.chartDot, { bottom: `${(d.value / maxTrend) * 80}%` }]} />
                      </View>
                      <Text style={styles.chartXLabel}>{d.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* APERCU DES SERVICES (donut statique) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Aperçu des services</Text>
            <Text style={styles.cardSub}>{bookings.length} réservations • {(bookings.reduce((s, b) => s + (b.amount_cents || 0), 0) / 100).toFixed(2)}€ revenus</Text>
            <View style={styles.donutWrap}>
              <View style={styles.donutOuter}>
                <View style={styles.donutInner}>
                  <Text style={styles.donutValue}>0</Text>
                  <Text style={styles.donutLabel}>Services</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ACTIVITE RECENTE */}
          <View style={styles.card}>
            <View style={styles.activityHeader}>
              <Text style={styles.cardTitle}>Activité récente</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.activityRow}>
              <View style={styles.activityIconWrap}>
                <Icon name="star" size={18} color="#fff" />
              </View>
              <View style={styles.activityTextWrap}>
                <Text style={styles.activityTitle}>Mes avis</Text>
                <View style={styles.activityStars}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Icon key={s} name="star-outline" size={14} color="#F4C28F" />
                  ))}
                  <Text style={styles.activityRate}>  0.0 (0 avis)</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },

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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: { fontSize: 22, fontWeight: '700', color: '#fff', fontStyle: 'italic' },
  headerLogoAccent: { color: '#fff' },
  headerRight: { flexDirection: 'row', gap: 12 },
  headerIconBtn: { padding: 4 },
  headerWelcome: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },

  // TOGGLE
  toggleWrap: { paddingHorizontal: 16, marginTop: 16 },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: radius.pill,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  toggleBtnActive: { backgroundColor: '#2E3A4E' },
  toggleText: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
  toggleTextActive: { color: '#fff' },

  // KPI
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 16,
  },
  kpiCard: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: 14,
    margin: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  kpiIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiMiniLine: {
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8E8E8',
  },
  kpiLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  kpiValue: { fontSize: 22, fontWeight: '700', color: colors.text },
  kpiSub: { fontSize: 11, color: '#A0A0A0', marginTop: 4 },

  // CARDS
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardSub: { fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: 16 },

  // CHART
  chartWrap: { flexDirection: 'row', height: 140 },
  chartYAxis: { justifyContent: 'space-between', paddingRight: 8, width: 28 },
  chartYLabel: { fontSize: 10, color: '#A0A0A0' },
  chartBody: { flex: 1, position: 'relative' },
  chartLinesRow: { position: 'absolute', left: 0, right: 0, top: 0, height: 100 },
  chartLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  chartDotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
    paddingBottom: 18,
  },
  chartDotCol: { alignItems: 'center', flex: 1 },
  chartDotWrap: {
    width: 10,
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E87A5D',
    position: 'absolute',
  },
  chartXLabel: { fontSize: 10, color: '#A0A0A0', marginTop: 6 },

  // DONUT
  donutWrap: { alignItems: 'center', marginVertical: 12 },
  donutOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 14,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInner: { alignItems: 'center' },
  donutValue: { fontSize: 22, fontWeight: '700', color: colors.text },
  donutLabel: { fontSize: 11, color: colors.textMuted },

  // ACTIVITY
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5A623',
    borderRadius: radius.lg,
    padding: 14,
  },
  activityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityTextWrap: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: '#fff' },
  activityStars: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  activityRate: { fontSize: 12, color: 'rgba(255,255,255,0.9)' },
});
