import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { forgotPassword } from '../../api/auth';
import AuthCanvas from '../../components/AuthCanvas';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [focus, setFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (e) {
      setError(e.message || 'Could not send the reset link. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCanvas>
      <TouchableOpacity
        className="flex-row items-center mb-6 self-start"
        onPress={() => navigation.goBack()}
        hitSlop={8}
      >
        <ArrowLeft size={18} color="#ffffff" strokeWidth={1.75} />
        <Text className="text-white text-sm ml-1.5">Back to sign in</Text>
      </TouchableOpacity>

      <View className="bg-white rounded-3xl px-5 pt-6 pb-6" style={{ shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 24, shadowOffset: { width: 0, height: 16 }, elevation: 8 }}>
        {sent ? (
          <View className="items-center py-4">
            <CheckCircle size={36} color="#0d9488" strokeWidth={1.75} />
            <Text className="text-[22px] font-semibold text-[#0a2540] mt-4">Check your email</Text>
            <Text className="text-sm text-[#6b7c93] text-center mt-2 leading-5">
              If an account exists for {email}, a reset link is on the way.
            </Text>
            <TouchableOpacity
              className="mt-6 bg-[#3d4ed7] rounded-xl h-[52px] px-6 items-center justify-center self-stretch"
              onPress={() => navigation.goBack()}
            >
              <Text className="text-white font-semibold text-[16px]">Back to sign in</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text className="text-[22px] font-semibold text-[#0a2540]">Reset password</Text>
            <Text className="text-sm text-[#6b7c93] mt-1 mb-5 leading-5">
              We will email a link if this address has an account.
            </Text>

            <Text className="text-[13px] font-medium text-[#0a2540] mb-1.5">Email</Text>
            <View
              className="rounded-xl px-3.5 h-[52px] bg-[#f6f9fc] mb-4 justify-center"
              style={{ borderWidth: 1.5, borderColor: focus ? '#3d4ed7' : '#e3e8ee' }}
            >
              <TextInput
                className="text-[#0a2540] text-[15px]"
                placeholder="you@company.com"
                placeholderTextColor="#8898aa"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                onSubmitEditing={handleSend}
                returnKeyType="go"
              />
            </View>

            {error ? (
              <View className="bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3 py-2.5 mb-4">
                <Text className="text-sm text-[#c41e3a] leading-5">{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              className="bg-[#3d4ed7] rounded-xl h-[52px] items-center justify-center"
              onPress={handleSend}
              disabled={loading}
              style={{ opacity: loading ? 0.75 : 1 }}
            >
              {loading
                ? <ActivityIndicator color="#ffffff" />
                : <Text className="text-white font-semibold text-[16px]">Send reset link</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>
    </AuthCanvas>
  );
}
