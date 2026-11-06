import { View, Text } from 'react-native';

export default function EmptyView({ icon: Icon, title, description }) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      {Icon && <Icon size={40} color="#8898aa" strokeWidth={1.5} />}
      {title && <Text className="text-sm font-semibold text-[#0a2540] text-center mt-3">{title}</Text>}
      {description && <Text className="text-xs text-[#6b7c93] text-center mt-1">{description}</Text>}
    </View>
  );
}
