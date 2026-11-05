import { View, Text } from 'react-native';

export default function StatCard({ label, value, sub }) {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm mr-3 min-w-[140px]">
      <Text className="text-xs text-[#64748b] uppercase tracking-widest mb-1">{label}</Text>
      <Text className="text-2xl font-semibold text-[#0f172a] tabular-nums">{value}</Text>
      {sub ? <Text className="text-xs text-[#64748b] mt-1">{sub}</Text> : null}
    </View>
  );
}
