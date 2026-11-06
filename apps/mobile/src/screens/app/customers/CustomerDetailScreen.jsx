import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Clipboard } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Copy, ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuth from '../../../hooks/useAuth';
import { getTokens } from '../../../store/auth';
import { getCustomer } from '../../../api/customers';
import SkeletonLoader from '../../../components/ui/SkeletonLoader';
import ErrorView from '../../../components/ui/ErrorView';
import SectionCard from '../../../components/ui/SectionCard';
import DetailRow from '../../../components/ui/DetailRow';

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CustomerDetailScreen({ navigation, route }) {
  const { customerId } = route.params;
  const { orgId } = useAuth();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const query = useQuery({
    queryKey: ['customer', orgId, customerId],
    queryFn: async () => {
      const { access } = await getTokens();
      return getCustomer(access, orgId, customerId);
    },
    enabled: !!orgId && !!customerId,
    staleTime: 30_000,
  });

  const customer = query.data;

  // Loading state
  if (query.isLoading) {
    return (
      <View className="flex-1 bg-[#f6f9fc]">
        {/* Custom header */}
        <View
          className="bg-white border-b border-[#e3e8ee] px-2 pb-3"
          style={{ paddingTop: insets.top + 8 }}
        >
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronLeft size={22} color="#0a2540" strokeWidth={1.5} />
            </TouchableOpacity>
            <Text className="flex-1 text-base font-semibold text-[#0a2540] ml-1">Customer</Text>
          </View>
        </View>
        <ScrollView className="px-4 pt-4">
          <SkeletonLoader height={140} borderRadius={16} className="mb-4" />
          <SkeletonLoader height={80} borderRadius={16} className="mb-4" />
          <SkeletonLoader height={120} borderRadius={16} className="mb-4" />
        </ScrollView>
      </View>
    );
  }

  // Error state
  if (query.isError) {
    return (
      <View className="flex-1 bg-[#f6f9fc]">
        <View
          className="bg-white border-b border-[#e3e8ee] px-2 pb-3"
          style={{ paddingTop: insets.top + 8 }}
        >
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronLeft size={22} color="#0a2540" strokeWidth={1.5} />
            </TouchableOpacity>
            <Text className="flex-1 text-base font-semibold text-[#0a2540] ml-1">Customer</Text>
          </View>
        </View>
        <ErrorView
          message={query.error?.message ?? 'Failed to load customer.'}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['customer', orgId, customerId] })}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f6f9fc]">
      {/* Custom header with back + edit */}
      <View
        className="bg-white border-b border-[#e3e8ee] px-2 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronLeft size={22} color="#0a2540" strokeWidth={1.5} />
          </TouchableOpacity>
          <Text className="flex-1 text-base font-semibold text-[#0a2540] ml-1" numberOfLines={1}>
            {customer?.name ?? 'Customer'}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditCustomer', { customer })}
            className="p-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Pencil size={20} color="#0a2540" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
      >
        {/* Header card */}
        <View className="bg-white rounded-lg p-5 mb-4 items-center">
          <View className="w-16 h-16 rounded-full bg-[#3d4ed7] items-center justify-center mb-3">
            <Text className="text-2xl font-bold text-white">
              {(customer?.name ?? '?')[0].toUpperCase()}
            </Text>
          </View>
          <Text className="text-lg font-semibold text-[#0a2540] mb-1">{customer?.name}</Text>
          <Text className="text-sm text-[#6b7c93]">{customer?.email}</Text>
          {customer?.externalId ? (
            <Text className="text-xs font-mono text-[#6b7c93] mt-1">{customer.externalId}</Text>
          ) : null}
        </View>

        {/* Stats row */}
        <View className="flex-row mb-4">
          <View className="flex-1 bg-white rounded-lg p-4 items-center mr-2">
            <Text className="text-2xl font-semibold text-[#0a2540] tabular-nums">
              {customer?._count?.subscriptions ?? '—'}
            </Text>
            <Text className="text-xs text-[#6b7c93] mt-1">Subscriptions</Text>
          </View>
          <View className="flex-1 bg-white rounded-lg p-4 items-center ml-2">
            <Text className="text-2xl font-semibold text-[#0a2540] tabular-nums">
              {customer?._count?.invoices ?? '—'}
            </Text>
            <Text className="text-xs text-[#6b7c93] mt-1">Invoices</Text>
          </View>
        </View>

        {/* Details section */}
        <SectionCard title="Details">
          <DetailRow label="Created" value={formatDate(customer?.createdAt)} />
          <DetailRow label="External ID" value={customer?.externalId ?? '—'} mono />
          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-3"
            onPress={() => Clipboard.setString(customer?.id ?? '')}
            activeOpacity={0.7}
          >
            <Text className="text-sm text-[#6b7c93]">Customer ID</Text>
            <View className="flex-row items-center flex-shrink">
              <Text className="text-sm text-[#0a2540] font-mono mr-2" numberOfLines={1}>
                {customer?.id}
              </Text>
              <Copy size={14} color="#6b7c93" strokeWidth={1.5} />
            </View>
          </TouchableOpacity>
        </SectionCard>

      </ScrollView>
    </View>
  );
}
