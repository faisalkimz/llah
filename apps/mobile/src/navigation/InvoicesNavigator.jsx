import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InvoicesScreen from '../screens/app/invoices/InvoicesScreen';
import InvoiceDetailScreen from '../screens/app/invoices/InvoiceDetailScreen';
import PaymentsScreen from '../screens/app/payments/PaymentsScreen';
import PaymentDetailScreen from '../screens/app/payments/PaymentDetailScreen';

const Stack = createNativeStackNavigator();

export default function InvoicesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Invoices" component={InvoicesScreen} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
      {/* Payments reachable from invoice detail (no longer a top-level tab). */}
      <Stack.Screen name="Payments" component={PaymentsScreen} />
      <Stack.Screen name="PaymentDetail" component={PaymentDetailScreen} />
    </Stack.Navigator>
  );
}
