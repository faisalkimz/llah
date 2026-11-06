import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard } from 'lucide-react-native';
import useAuth from '../../../hooks/useAuth';
import { getTokens } from '../../../store/auth';
import { getPayments } from '../../../api/payments';
import AppBar from '../../../components/AppBar';
import Badge from '../../../components/ui/Badge';
import SkeletonLoader from '../../../components/ui/SkeletonLoader';
import ErrorView from '../../../components/ui/ErrorView';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'SUCCEEDED', label: 'Succeeded' },
  { key: 'FAILED', label: 'Failed' },
];

function fmtCurrency(minor) {
  const n = Number(minor || 0) / 100;
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusVariant(s) {
  switch (s) {
    case 'SUCCEEDED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
      return 'danger';
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export default function PaymentsScreen({ navigation }) {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const query = useQuery({
    queryKey: ['payments', orgId, filter],
    queryFn: async () => {
      const { access } = await getTokens();
      return getPayments(access, orgId, { limit: 20, offset: 0, status: filter });
    },
    enabled: !!orgId,
    staleTime: 30_000,
  });

  const payments = Array.isArray(query.data) ? query.data : [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['payments', orgId] });
    setRefreshing(false);
  }, [queryClient, orgId]);

  // No-org state
  if (!orgId) {
    return (
      <View className="flex-1 bg-[#f6f9fc]">
        <AppBar title="Payments" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-sm text-[#6b7c93] text-center">
            Select an organization to view payments
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (query.isError && !query.data) {
    return (
      <View className="flex-1 bg-[#f6f9fc]">
        <AppBar title="Payments" />
        <ErrorView
          message={query.error?.message ?? 'Failed to load payments.'}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['payments', orgId] })}
        />
      </View>
    );
  }

  // Loading skeleton
  if (query.isLoading) {
    return (
      <View className="flex-1 bg-[#f6f9fc]">
        <AppBar title="Payments" />
        <View className="mx-4 mt-4 bg-white rounded-lg overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <View key={i} className="flex-row items-center px-4 py-3 border-b border-[#e3e8ee]">
              <View className="flex-1">
                <SkeletonLoader height={18} width="45%" borderRadius={6} />
                <SkeletonLoader height={11} width="55%" borderRadius={6} className="mt-1.5" />
              </View>
              <View className="items-end">
                <SkeletonLoader width={44} height={18} borderRadius={9} />
                <SkeletonLoader width={60} height={11} borderRadius={6} className="mt-1.5" />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f6f9fc]">
      <AppBar title="Payments" />

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full mr-2 ${
                active ? 'bg-[#3d4ed7]' : 'bg-white border border-[#e3e8ee]'
              }`}
            >
              <Text
                className={`text-xs font-medium ${active ? 'text-white' : 'text-[#6b7c93]'}`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View className="mx-4 flex-1 bg-white rounded-lg overflow-hidden">
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3d4ed7" />
          }
          ItemSeparatorComponent={() => <View className="h-px bg-[#e3e8ee]" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 bg-white"
              onPress={() => navigation.navigate('PaymentDetail', { id: item.id })}
              activeOpacity={0.7}
            >
              <View className="flex-1">
                <Text className="text-lg font-semibold text-[#0a2540] tabular-nums">
                  {fmtCurrency(item.amountMinor)}
                </Text>
                <Text className="text-xs text-[#6b7c93] font-mono mt-1" numberOfLines={1}>
                  {item.invoiceId ?? 'No invoice'}
                </Text>
              </View>
              <View className="items-end ml-2">
                <Badge label={item.status} variant={statusVariant(item.status)} />
                <Text className="text-xs text-[#8898aa] mt-1.5">{fmtDate(item.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !query.isLoading ? (
              <View className="items-center justify-center py-16 px-6">
                <CreditCard size={48} color="#8898aa" strokeWidth={1.5} />
                <Text className="text-base font-medium text-[#0a2540] mt-4">No payments</Text>
                <Text className="text-sm text-[#6b7c93] mt-1 text-center">
                  Payments will appear here once processed
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </View>
  );
}
