import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from '../components/Icon';
import ProfessionalDashboard from '../screens/ProfessionalDashboard';
import ProfessionalCalendarScreen from '../screens/ProfessionalCalendarScreen';
import { colors, radius, spacing } from '../theme/colors';

type ProTab = 'dashboard' | 'calendar' | 'profile';

export default function ProfessionalNavigator() {
  const [currentTab, setCurrentTab] = useState<ProTab>('dashboard');

  const tabs: { key: ProTab; label: string; icon: any }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: 'bar-chart' },
    { key: 'calendar', label: 'Calendrier', icon: 'calendar' },
    { key: 'profile', label: 'Mon Profil', icon: 'person' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.screen}>
        {currentTab === 'dashboard' && <ProfessionalDashboard />}
        {currentTab === 'calendar' && <ProfessionalCalendarScreen />}
        {currentTab === 'profile' && (
          <View style={styles.placeholder}>
            <Icon name="person-outline" size={48} color={colors.textMuted} />
            <Text style={styles.placeholderText}>Mon Profil</Text>
          </View>
        )}
      </View>

      {/* BOTTOM NAV BAR PRO */}
      <View style={styles.navBar}>
        {tabs.map((t) => {
          const active = currentTab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={styles.navItem}
              onPress={() => setCurrentTab(t.key)}
              activeOpacity={0.7}
            >
              <Icon
              name={t.icon}
              size={22}
              color={active ? colors.primary : colors.textMuted}
            />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1 },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FA',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 12,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EADBC8',
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
