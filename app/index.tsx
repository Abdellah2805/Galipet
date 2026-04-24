import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import RootNavigator from '../src/navigation/RootNavigator';

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <RootNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
