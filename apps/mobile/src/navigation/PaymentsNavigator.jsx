import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PaymentsScreen from '../screens/app/payments/PaymentsScreen';
import PaymentDetailScreen from '../screens/app/payments/PaymentDetailScreen';

const Stack = createNativeStackNavigator();

export default function PaymentsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Payments" component={PaymentsScreen} />
      <Stack.Screen name="PaymentDetail" component={PaymentDetailScreen} />
    </Stack.Navigator>
  );
}
