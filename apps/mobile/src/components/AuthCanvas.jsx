import { View, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AuthCanvas({ children }) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#061018]">
      <StatusBar barStyle="light-content" />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -140,
          left: '50%',
          marginLeft: -210,
          width: 420,
          height: 420,
          borderRadius: 210,
          backgroundColor: '#3d4ed7',
          opacity: 0.22,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: -80,
          right: -60,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: '#123055',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: '28%',
          left: 28,
          width: 72,
          height: 2,
          backgroundColor: '#3d4ed7',
          opacity: 0.7,
        }}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 22,
          }}
        >
          <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center' }}>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
