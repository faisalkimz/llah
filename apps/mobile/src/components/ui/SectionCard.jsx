import { View, Text } from 'react-native';

export default function SectionCard({ title, children }) {
  return (
    <View className="bg-white rounded-lg overflow-hidden mb-4">
      {title ? (
        <View className="px-4 pt-4 pb-2 border-b border-[#e3e8ee]">
          <Text className="text-[13px] font-medium text-[#0a2540]">
            {title}
          </Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}
