import { View, Text } from 'react-native';

export default function EmptyView({ icon: Icon, title, description }) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      {Icon && <Icon size={40} color="#94a3b8" strokeWidth={1.5} />}
      {title && <Text className="text-sm font-semibold text-[#0f172a] text-center mt-3">{title}</Text>}
      {description && <Text className="text-xs text-[#64748b] text-center mt-1">{description}</Text>}
    </View>
  );
}
