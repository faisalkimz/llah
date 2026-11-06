import { View, Text } from 'react-native';

const VARIANTS = {
  success: { bg: '#f0fdfa', text: '#0d9488' },
  warning: { bg: '#fffbeb', text: '#b45309' },
  danger:  { bg: '#fef2f2', text: '#c41e3a' },
  info:    { bg: '#eef0fb', text: '#3d4ed7' },
  neutral: { bg: '#f6f9fc', text: '#6b7c93' },
};

export default function Badge({ label, variant = 'neutral' }) {
  const tone = VARIANTS[variant] ?? VARIANTS.neutral;
  return (
    <View className="flex-row items-center px-2 py-0.5 rounded-full" style={{ backgroundColor: tone.bg }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: tone.text, marginRight: 6 }} />
      <Text className="text-xs font-medium" style={{ color: tone.text }}>{label}</Text>
    </View>
  );
}
