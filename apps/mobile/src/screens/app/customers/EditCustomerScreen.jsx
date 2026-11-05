import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuth from '../../../hooks/useAuth';
import { getTokens } from '../../../store/auth';
import { updateCustomer } from '../../../api/customers';

export default function EditCustomerScreen({ navigation, route }) {
  const { customer } = route.params;
  const { orgId } = useAuth();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(customer?.name ?? '');
  const [email, setEmail] = useState(customer?.email ?? '');
  const [externalId, setExternalId] = useState(customer?.externalId ?? '');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const mutation = useMutation({
    mutationFn: async (data) => {
      const { access } = await getTokens();
      return updateCustomer(access, orgId, customer.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', orgId, customer.id] });
      navigation.goBack();
    },
    onError: (err) => {
      setApiError(err?.message ?? 'Failed to update customer. Please try again.');
    },
  });

  function validate() {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    return errs;
  }

  function handleSubmit() {
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const data = { name: name.trim(), email: email.trim() };
    if (externalId.trim()) data.externalId = externalId.trim();
    mutation.mutate(data);
  }

  return (
    <View className="flex-1 bg-[#f8fafc]">
      {/* Custom header */}
      <View
        className="bg-white border-b border-[#e2e8f0] px-2 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={22} color="#0f172a" strokeWidth={1.5} />
          </TouchableOpacity>
          <Text className="flex-1 text-base font-semibold text-[#0f172a] ml-1">Edit customer</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* API error banner */}
          {apiError ? (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Text className="text-sm text-[#ef4444]">{apiError}</Text>
            </View>
          ) : null}

          {/* Name field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-[#0f172a] mb-1.5">
              Name <Text className="text-[#ef4444]">*</Text>
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Acme Corp"
              placeholderTextColor="#94a3b8"
              className={`bg-white border rounded-xl px-4 h-12 text-sm text-[#0f172a] ${
                errors.name ? 'border-[#ef4444]' : 'border-[#e2e8f0]'
              }`}
              autoCapitalize="words"
            />
            {errors.name ? (
              <Text className="text-xs text-[#ef4444] mt-1">{errors.name}</Text>
            ) : null}
          </View>

          {/* Email field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-[#0f172a] mb-1.5">
              Email <Text className="text-[#ef4444]">*</Text>
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="billing@acme.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className={`bg-white border rounded-xl px-4 h-12 text-sm text-[#0f172a] ${
                errors.email ? 'border-[#ef4444]' : 'border-[#e2e8f0]'
              }`}
            />
            {errors.email ? (
              <Text className="text-xs text-[#ef4444] mt-1">{errors.email}</Text>
            ) : null}
          </View>

          {/* External ID field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-[#0f172a] mb-1.5">External ID</Text>
            <TextInput
              value={externalId}
              onChangeText={setExternalId}
              placeholder="cus_abc123"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              autoCorrect={false}
              className="bg-white border border-[#e2e8f0] rounded-xl px-4 h-12 text-sm text-[#0f172a]"
            />
            <Text className="text-xs text-[#64748b] mt-1">
              Your internal identifier for this customer
            </Text>
          </View>

          {/* Submit button */}
          <TouchableOpacity
            className="bg-[#0f172a] rounded-xl h-12 items-center justify-center mt-4"
            onPress={handleSubmit}
            disabled={mutation.isPending}
            activeOpacity={0.85}
          >
            {mutation.isPending ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="text-white font-semibold text-sm">Save changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
