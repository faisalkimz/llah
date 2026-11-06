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
import { ChevronRight, RefreshCw } from 'lucide-react-native';
import useAuth from '../../../hooks/useAuth';
import { getTokens } from '../../../store/auth';
import { getSubscriptions } from '../../../api/subscriptions';
import AppBar from '../../../components/AppBar';
import Badge from '../../../components/ui/Badge';
import SkeletonLoader from '../../../components/ui/SkeletonLoader';
import ErrorView from '../../../components/ui/ErrorView';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'CANCELED', label: 'Canceled' },
];

function fmtCurrency(minor) {
  const n = Number(minor || 0) / 100;
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function statusVariant(s) {
  switch (s) {
    case 'ACTIVE':
      return 'success';
    case 'PAST_DUE':
      return 'danger';
    case 'CANCELED':
    case 'PAUSED':
      return 'neutral';
    default:
      return 'neutral';
  }
}

// Sum of flat plan-item prices is the recurring amount for the period.
function periodAmount(sub) {
  const items = sub?.plan?.items ?? [];
  let sum = 0;
  let hasAmount = false;
  for (const it of items) {
    const v = it?.price?.unitAmountMinor;
    if (v != null && v !== '') {
      sum += Number(v);
      hasAmount = true;
    }
  }
  return hasAmount ? fmtCurrency(sum) : '—';
}

export default function SubscriptionsScreen({ navigation }) {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const query = useQuery({
    queryKey: ['subscriptions', orgId, filter],
    queryFn: async () => {
      const { access } = await getTokens();
      return getSubscriptions(access, orgId, { limit: 20, offset: 0, status: filter });
    },
    enabled: !!orgId,
    staleTime: 30_000,
  });

  const subscriptions = Array.isArray(query.data) ? query.data : [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['subscriptions', orgId] });
    setRefreshing(false);
  }, [queryClient, orgId]);

  // No-org state
  if (!orgId) {
    return (
      <View className="flex-1 bg-[#f6f9fc]">
        <AppBar title="Subscriptions" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-sm text-[#6b7c93] text-center">
            Select an organization to view subscriptions
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (query.isError && !query.data) {
    return (
      <View className="flex-1 bg-[#f6f9fc]">
        <AppBar title="Subscriptions" />
        <ErrorView
          message={query.error?.message ?? 'Failed to load subscriptions.'}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['subscriptions', orgId] })}
        />
      </View>
    );
  }

  // Loading skeleton
  if (query.isLoading) {
    return (
      <View className="flex-1 bg-[#f6f9fc]">
        <AppBar title="Subscriptions" />
        <View className="mx-4 mt-4 bg-white rounded-lg overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <View key={i} className="flex-row items-center px-4 py-3 border-b border-[#e3e8ee]">
              <SkeletonLoader width={70} height={20} borderRadius={10} />
              <View className="flex-1 ml-3">
                <SkeletonLoader height={14} width="60%" borderRadius={6} />
                <SkeletonLoader height={11} width="40%" borderRadius={6} className="mt-1.5" />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f6f9fc]">
      <AppBar title="Subscriptions" />

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
          data={subscriptions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3d4ed7" />
          }
          ItemSeparatorComponent={() => <View className="h-px bg-[#e3e8ee]" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 bg-white"
              onPress={() => navigation.navigate('SubscriptionDetail', { id: item.id })}
              activeOpacity={0.7}
            >
              <Badge label={item.status} variant={statusVariant(item.status)} />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-medium text-[#0a2540]" numberOfLines={1}>
                  {item.customer?.name ?? item.customerId}
                </Text>
                <Text className="text-xs text-[#6b7c93] mt-0.5" numberOfLines={1}>
                  {item.plan?.name ?? 'Custom plan'}
                </Text>
              </View>
              <Text className="text-sm text-[#0a2540] mr-2">{periodAmount(item)}</Text>
              <ChevronRight size={18} color="#8898aa" strokeWidth={1.5} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !query.isLoading ? (
              <View className="items-center justify-center py-16 px-6">
                <RefreshCw size={48} color="#8898aa" strokeWidth={1.5} />
                <Text className="text-base font-medium text-[#0a2540] mt-4">No subscriptions</Text>
                <Text className="text-sm text-[#6b7c93] mt-1 text-center">
                  {filter === 'ACTIVE'
                    ? 'There are no active subscriptions'
                    : filter === 'CANCELED'
                    ? 'There are no canceled subscriptions'
                    : 'Subscriptions will appear here once created'}
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
