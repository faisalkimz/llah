import { View, Text } from 'react-native';

const VARIANTS = {
  success: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-700' },
  danger:  { bg: 'bg-red-50',   text: 'text-red-600'    },
  info:    { bg: 'bg-sky-50',   text: 'text-sky-700'    },
  neutral: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

export default function Badge({ label, variant = 'neutral' }) {
  const { bg, text } = VARIANTS[variant] ?? VARIANTS.neutral;
  return (
    <View className={`px-2.5 py-0.5 rounded-full ${bg}`}>
      <Text className={`text-xs font-medium ${text}`}>{label}</Text>
    </View>
  );
}
