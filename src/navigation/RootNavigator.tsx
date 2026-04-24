import React from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { colors } from '../theme/colors';

export default function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        {session ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
