import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';

export default function SearchBar({ value, onChangeText, placeholder }) {
  return (
    <View className="bg-white border border-[#e2e8f0] rounded-xl h-11 px-4 flex-row items-center">
      <Search size={18} color="#64748b" strokeWidth={1.5} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        className="flex-1 ml-2 text-sm text-[#0f172a]"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value ? (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={16} color="#64748b" strokeWidth={1.5} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
