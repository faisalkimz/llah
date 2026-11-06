import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InvoicesScreen from '../screens/app/invoices/InvoicesScreen';
import InvoiceDetailScreen from '../screens/app/invoices/InvoiceDetailScreen';

const Stack = createNativeStackNavigator();

export default function InvoicesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Invoices" component={InvoicesScreen} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
    </Stack.Navigator>
  );
}
