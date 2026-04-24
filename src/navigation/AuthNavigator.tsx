import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterChoiceScreen from '../screens/RegisterChoiceScreen';
import RegisterCustomerScreen from '../screens/RegisterCustomerScreen';
import RegisterCompanyScreen from '../screens/RegisterCompanyScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.primary,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Galipet' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion' }} />
      <Stack.Screen name="RegisterChoice" component={RegisterChoiceScreen} options={{ title: 'Inscription' }} />
      <Stack.Screen name="RegisterCustomer" component={RegisterCustomerScreen} options={{ title: 'Particulier' }} />
      <Stack.Screen name="RegisterCompany" component={RegisterCompanyScreen} options={{ title: 'Professionnel' }} />
    </Stack.Navigator>
  );
}
