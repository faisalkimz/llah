import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  LayoutDashboard,
  Users,
  RefreshCw,
  Receipt,
  Code,
  Settings,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/app/HomeScreen';
import CustomersNavigator from './CustomersNavigator';
import SubscriptionsNavigator from './SubscriptionsNavigator';
import InvoicesNavigator from './InvoicesNavigator';
import DeveloperNavigator from './DeveloperNavigator';
import SettingsNavigator from './SettingsNavigator';
import { colors } from '../theme';

const TABS = [
  { name: 'Home', Icon: LayoutDashboard, Screen: HomeScreen },
  { name: 'Customers', Icon: Users, Screen: CustomersNavigator },
  { name: 'Subscriptions', Icon: RefreshCw, Screen: SubscriptionsNavigator },
  { name: 'Invoices', Icon: Receipt, Screen: InvoicesNavigator },
  { name: 'Developer', Icon: Code, Screen: DeveloperNavigator },
  { name: 'Settings', Icon: Settings, Screen: SettingsNavigator },
];

export default function AppNavigator() {
  const [active, setActive] = useState('Home');
  const insets = useSafeAreaInsets();
  const { Screen } = TABS.find(t => t.name === active);

  return (
    <View className="flex-1 bg-[#f6f9fc]">
      <View className="flex-1">
        <Screen />
      </View>
      <View
        className="bg-white border-t border-[#e3e8ee] flex-row"
        style={{ paddingBottom: Math.max(insets.bottom, 8), paddingTop: 6 }}
      >
        {TABS.map(({ name, Icon }) => {
          const selected = active === name;
          const color = selected ? colors.accent : colors.faint;
          return (
            <TouchableOpacity
              key={name}
              className="flex-1 items-center justify-center"
              onPress={() => setActive(name)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={name}
            >
              <Icon size={20} color={color} strokeWidth={1.5} />
              <Text style={{ color, fontSize: 11, marginTop: 2, fontWeight: selected ? '600' : '500' }}>
                {name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
