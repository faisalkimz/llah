import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../screens/app/SettingsScreen';
import NotificationsScreen from '../screens/app/NotificationsScreen';

const Stack = createNativeStackNavigator();

export default function SettingsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
