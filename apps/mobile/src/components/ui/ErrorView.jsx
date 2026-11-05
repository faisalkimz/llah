import { View, Text, TouchableOpacity } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

export default function ErrorView({ message = 'Something went wrong.', onRetry }) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <AlertCircle size={40} color="#ef4444" strokeWidth={1.5} />
      <Text className="text-sm text-[#64748b] text-center mt-3 mb-4">{message}</Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="bg-[#0f172a] px-5 py-2.5 rounded-xl"
        >
          <Text className="text-white text-sm font-medium">Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
