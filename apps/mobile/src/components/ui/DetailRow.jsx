import { View, Text, TouchableOpacity } from 'react-native';

export default function DetailRow({ label, value, mono = false, onPress }) {
  const Container = onPress ? TouchableOpacity : View;
  const containerProps = onPress ? { onPress } : {};

  return (
    <Container
      {...containerProps}
      className="flex-row items-center justify-between px-4 py-3 border-b border-[#e3e8ee]"
    >
      <Text className="text-sm text-[#6b7c93]">{label}</Text>
      <Text
        className={`text-sm text-[#0a2540] flex-shrink${mono ? ' font-mono' : ''}`}
        numberOfLines={1}
      >
        {value}
      </Text>
    </Container>
  );
}
