import { View, Text } from 'react-native';

export default function StatCard({ label, value, sub }) {
  return (
    <View className="bg-white border border-[#e3e8ee] rounded-lg px-4 py-3 mr-3 min-w-[148px]">
      <Text className="text-[13px] text-[#6b7c93] mb-1">{label}</Text>
      <Text className="text-[22px] font-semibold text-[#0a2540]">{value}</Text>
      {sub ? <Text className="text-xs text-[#6b7c93] mt-1">{sub}</Text> : null}
    </View>
  );
}
