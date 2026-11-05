import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppBar({ title, subtitle, rightComponent }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="bg-white border-b border-[#e2e8f0] px-4 pb-3"
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-[#0f172a]" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-xs text-[#64748b] mt-0.5" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightComponent ? <View className="ml-3">{rightComponent}</View> : null}
      </View>
    </View>
  );
}
