import { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { BarChart2, Users, Code2, Settings2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/app/HomeScreen';
import CustomersScreen from '../screens/app/CustomersScreen';
import DeveloperScreen from '../screens/app/DeveloperScreen';
import SettingsScreen from '../screens/app/SettingsScreen';

const TABS = [
  { name: 'Home', Icon: BarChart2, Screen: HomeScreen },
  { name: 'Customers', Icon: Users, Screen: CustomersScreen },
  { name: 'Developer', Icon: Code2, Screen: DeveloperScreen },
  { name: 'Settings', Icon: Settings2, Screen: SettingsScreen },
];

export default function AppNavigator() {
  const [active, setActive] = useState('Home');
  const insets = useSafeAreaInsets();
  const { Screen } = TABS.find(t => t.name === active);

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <View className="flex-1">
        <Screen />
      </View>
      <View
        className="bg-white border-t border-[#e2e8f0] flex-row"
        style={{ paddingBottom: insets.bottom, height: 60 + insets.bottom }}
      >
        {TABS.map(({ name, Icon }) => (
          <TouchableOpacity
            key={name}
            className="flex-1 items-center justify-center"
            onPress={() => setActive(name)}
          >
            <Icon
              size={22}
              color={active === name ? '#0ea5e9' : '#94a3b8'}
              strokeWidth={1.5}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
