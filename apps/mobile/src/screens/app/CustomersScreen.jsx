import { View } from 'react-native';
import { Users } from 'lucide-react-native';
import AppBar from '../../components/AppBar';
import EmptyView from '../../components/ui/EmptyView';

export default function CustomersScreen() {
  return (
    <View className="flex-1 bg-[#f8fafc]">
      <AppBar title="Customers" />
      <EmptyView
        icon={Users}
        title="Customer list coming soon"
        description="Customer management will be available in the next module."
      />
    </View>
  );
}
