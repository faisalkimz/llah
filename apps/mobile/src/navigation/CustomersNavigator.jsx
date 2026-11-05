import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomersScreen from '../screens/app/customers/CustomersScreen';
import CustomerDetailScreen from '../screens/app/customers/CustomerDetailScreen';
import CreateCustomerScreen from '../screens/app/customers/CreateCustomerScreen';
import EditCustomerScreen from '../screens/app/customers/EditCustomerScreen';

const Stack = createNativeStackNavigator();

export default function CustomersNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Customers" component={CustomersScreen} />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
      <Stack.Screen name="CreateCustomer" component={CreateCustomerScreen} />
      <Stack.Screen name="EditCustomer" component={EditCustomerScreen} />
    </Stack.Navigator>
  );
}
