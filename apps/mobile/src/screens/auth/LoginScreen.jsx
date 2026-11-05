import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import useAuth from '../../hooks/useAuth';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(e.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#f8fafc]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-24 pb-10">
          {/* Wordmark */}
          <View className="items-center mb-10">
            <Text className="text-3xl font-bold text-[#0f172a]">Llah</Text>
            <Text className="text-sm text-[#64748b] mt-1">Metered billing infrastructure</Text>
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-xs font-medium text-[#64748b] mb-1.5 uppercase tracking-wide">Email</Text>
            <TextInput
              className="bg-white border border-[#e2e8f0] rounded-xl px-4 h-12 text-[#0f172a] text-sm"
              placeholder="you@example.com"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <View className="mb-6">
            <Text className="text-xs font-medium text-[#64748b] mb-1.5 uppercase tracking-wide">Password</Text>
            <View className="flex-row items-center bg-white border border-[#e2e8f0] rounded-xl px-4 h-12">
              <TextInput
                className="flex-1 text-[#0f172a] text-sm"
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPw}
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPw(v => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {showPw
                  ? <EyeOff size={18} color="#94a3b8" strokeWidth={1.5} />
                  : <Eye size={18} color="#94a3b8" strokeWidth={1.5} />
                }
              </TouchableOpacity>
            </View>
          </View>

          {/* Error */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Text className="text-sm text-red-600">{error}</Text>
            </View>
          )}

          {/* Sign in button */}
          <TouchableOpacity
            className="bg-[#0f172a] rounded-xl h-12 items-center justify-center"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#ffffff" />
              : <Text className="text-white font-semibold text-sm">Sign in</Text>
            }
          </TouchableOpacity>

          {/* Forgot password */}
          <TouchableOpacity
            className="mt-4 items-center"
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text className="text-sm text-[#64748b]">Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
