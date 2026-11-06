import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DeveloperScreen from '../screens/app/developer/DeveloperScreen';
import ApiKeysScreen from '../screens/app/developer/ApiKeysScreen';
import EventLogScreen from '../screens/app/developer/EventLogScreen';
import WebhooksScreen from '../screens/app/developer/WebhooksScreen';

const Stack = createNativeStackNavigator();

export default function DeveloperNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Developer" component={DeveloperScreen} />
      <Stack.Screen name="ApiKeys" component={ApiKeysScreen} />
      <Stack.Screen name="EventLog" component={EventLogScreen} />
      <Stack.Screen name="Webhooks" component={WebhooksScreen} />
    </Stack.Navigator>
  );
}
