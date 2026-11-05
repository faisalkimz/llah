import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { forgotPassword } from '../../api/auth';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
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
        <View className="flex-1 px-6 pt-14 pb-10">
          <TouchableOpacity
            className="flex-row items-center mb-8"
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={20} color="#0f172a" strokeWidth={1.5} />
            <Text className="text-sm text-[#0f172a] ml-1">Back</Text>
          </TouchableOpacity>

          {sent ? (
            <View className="items-center pt-10">
              <CheckCircle size={48} color="#10b981" strokeWidth={1.5} />
              <Text className="text-lg font-semibold text-[#0f172a] mt-4">Check your email</Text>
              <Text className="text-sm text-[#64748b] text-center mt-2">
                If an account exists for {email}, you'll receive a password reset link shortly.
              </Text>
              <TouchableOpacity
                className="mt-8 bg-[#0f172a] rounded-xl h-12 px-8 items-center justify-center"
                onPress={() => navigation.goBack()}
              >
                <Text className="text-white font-semibold text-sm">Back to sign in</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text className="text-2xl font-bold text-[#0f172a] mb-1">Reset password</Text>
              <Text className="text-sm text-[#64748b] mb-8">
                Enter your email and we'll send you a reset link.
              </Text>

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

              {error && (
                <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <Text className="text-sm text-red-600">{error}</Text>
                </View>
              )}

              <TouchableOpacity
                className="bg-[#0f172a] rounded-xl h-12 items-center justify-center"
                onPress={handleSend}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#ffffff" />
                  : <Text className="text-white font-semibold text-sm">Send reset link</Text>
                }
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
