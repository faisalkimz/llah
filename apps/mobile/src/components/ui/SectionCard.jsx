import { View, Text } from 'react-native';

export default function SectionCard({ title, children }) {
  return (
    <View className="bg-white rounded-2xl overflow-hidden mb-4">
      {title ? (
        <View className="px-4 pt-4 pb-2 border-b border-[#e2e8f0]">
          <Text className="text-xs font-semibold text-[#64748b] uppercase tracking-widest">
            {title}
          </Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}
