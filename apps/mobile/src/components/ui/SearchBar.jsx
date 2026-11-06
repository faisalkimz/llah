import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';

export default function SearchBar({ value, onChangeText, placeholder }) {
  return (
    <View className="bg-white border border-[#e3e8ee] rounded-xl h-11 px-4 flex-row items-center">
      <Search size={18} color="#6b7c93" strokeWidth={1.5} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8898aa"
        className="flex-1 ml-2 text-sm text-[#0a2540]"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value ? (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={16} color="#6b7c93" strokeWidth={1.5} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
