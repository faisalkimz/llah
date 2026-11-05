import { View, Text, TouchableOpacity } from 'react-native';

export default function DetailRow({ label, value, mono = false, onPress }) {
  const Container = onPress ? TouchableOpacity : View;
  const containerProps = onPress ? { onPress } : {};

  return (
    <Container
      {...containerProps}
      className="flex-row items-center justify-between px-4 py-3 border-b border-[#e2e8f0]"
    >
      <Text className="text-sm text-[#64748b]">{label}</Text>
      <Text
        className={`text-sm text-[#0f172a] flex-shrink${mono ? ' font-mono' : ''}`}
        numberOfLines={1}
      >
        {value}
      </Text>
    </Container>
  );
}
