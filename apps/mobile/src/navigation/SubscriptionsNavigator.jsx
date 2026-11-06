import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SubscriptionsScreen from '../screens/app/subscriptions/SubscriptionsScreen';
import SubscriptionDetailScreen from '../screens/app/subscriptions/SubscriptionDetailScreen';

const Stack = createNativeStackNavigator();

export default function SubscriptionsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} />
      <Stack.Screen name="SubscriptionDetail" component={SubscriptionDetailScreen} />
    </Stack.Navigator>
  );
}
