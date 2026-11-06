import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import useAuth from '../../hooks/useAuth';
import AuthCanvas from '../../components/AuthCanvas';

function Field({ label, focused, children, trailing }) {
  return (
    <View className="mb-4">
      <Text className="text-[13px] font-medium text-[#0a2540] mb-1.5">{label}</Text>
      <View
        className="flex-row items-center rounded-xl px-3.5 h-[52px] bg-[#f6f9fc]"
        style={{ borderWidth: 1.5, borderColor: focused ? '#3d4ed7' : '#e3e8ee' }}
      >
        {children}
        {trailing}
      </View>
    </View>
  );
}

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [focus, setFocus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(e.message || 'Sign-in failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCanvas>
      <View className="items-center mb-7">
        <View className="w-14 h-14 rounded-2xl bg-white items-center justify-center mb-4">
          <Text className="text-[#0a2540] text-[22px] font-bold">L</Text>
          <View className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#3d4ed7]" />
        </View>
        <Text className="text-white text-[34px] font-semibold tracking-tight">Llah</Text>
        <Text className="text-[#9aadc2] text-[15px] mt-2 text-center leading-5">
          Sign in to the workspace you already use on the web.
        </Text>
      </View>

      <View className="bg-white rounded-3xl px-5 pt-6 pb-6" style={{ shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 24, shadowOffset: { width: 0, height: 16 }, elevation: 8 }}>
        <Text className="text-[22px] font-semibold text-[#0a2540]">Welcome back</Text>
        <Text className="text-sm text-[#6b7c93] mt-1 mb-5">Email and password for this account.</Text>

        <Field label="Email" focused={focus === 'email'}>
          <TextInput
            className="flex-1 text-[#0a2540] text-[15px]"
            placeholder="you@company.com"
            placeholderTextColor="#8898aa"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocus('email')}
            onBlur={() => setFocus(null)}
            returnKeyType="next"
          />
        </Field>

        <View className="flex-row items-center justify-between mb-1.5">
          <Text className="text-[13px] font-medium text-[#0a2540]">Password</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} hitSlop={8}>
            <Text className="text-[13px] font-medium text-[#3d4ed7]">Forgot password?</Text>
          </TouchableOpacity>
        </View>
        <View
          className="flex-row items-center rounded-xl px-3.5 h-[52px] bg-[#f6f9fc] mb-4"
          style={{ borderWidth: 1.5, borderColor: focus === 'password' ? '#3d4ed7' : '#e3e8ee' }}
        >
          <TextInput
            className="flex-1 text-[#0a2540] text-[15px]"
            placeholder="Password"
            placeholderTextColor="#8898aa"
            secureTextEntry={!showPw}
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocus('password')}
            onBlur={() => setFocus(null)}
            onSubmitEditing={handleLogin}
            returnKeyType="go"
          />
          <TouchableOpacity onPress={() => setShowPw(v => !v)} hitSlop={8} accessibilityLabel={showPw ? 'Hide password' : 'Show password'}>
            {showPw
              ? <EyeOff size={18} color="#6b7c93" strokeWidth={1.75} />
              : <Eye size={18} color="#6b7c93" strokeWidth={1.75} />}
          </TouchableOpacity>
        </View>

        {error ? (
          <View className="bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3 py-2.5 mb-4">
            <Text className="text-sm text-[#c41e3a] leading-5">{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          className="bg-[#3d4ed7] rounded-xl h-[52px] items-center justify-center"
          onPress={handleLogin}
          disabled={loading}
          accessibilityRole="button"
          style={{ opacity: loading ? 0.75 : 1 }}
        >
          {loading
            ? <ActivityIndicator color="#ffffff" />
            : <Text className="text-white font-semibold text-[16px]">Sign in</Text>}
        </TouchableOpacity>
      </View>
    </AuthCanvas>
  );
}
