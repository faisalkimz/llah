import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuth from '../../../hooks/useAuth';
import { getTokens } from '../../../store/auth';
import { getSubscription, cancelSubscription } from '../../../api/subscriptions';
import SkeletonLoader from '../../../components/ui/SkeletonLoader';
import ErrorView from '../../../components/ui/ErrorView';
import SectionCard from '../../../components/ui/SectionCard';
import DetailRow from '../../../components/ui/DetailRow';
import Badge from '../../../components/ui/Badge';

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

function billingInterval(sub) {
  const interval = (sub?.plan?.interval || 'MONTH').toLowerCase();
  const count = Number(sub?.plan?.intervalCount || 1);
  if (count <= 1) {
    return `Every ${interval}`;
  }
  return `Every ${count} ${interval}s`;
}

export default function SubscriptionDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const { orgId } = useAuth();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const query = useQuery({
    queryKey: ['subscription', orgId, id],
    queryFn: async () => {
      const { access } = await getTokens();
      return getSubscription(access, orgId, id);
    },
    enabled: !!orgId && !!id,
    staleTime: 30_000,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const { access } = await getTokens();
      return cancelSubscription(access, orgId, id, { immediate: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', orgId] });
      queryClient.invalidateQueries({ queryKey: ['subscription', orgId, id] });
      navigation.goBack();
    },
    onError: (error) => {
      Alert.alert(
        'Could not cancel subscription',
        error?.message ?? 'Something went wrong. Please try again.',
      );
    },
  });

  function confirmCancel() {
    Alert.alert(
      'Cancel subscription',
      'This subscription will be canceled at the end of the current billing period.',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel subscription',
          style: 'destructive',
          onPress: () => cancelMutation.mutate(),
        },
      ]
    );
  }

  const sub = query.data;
  const Header = (
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
        <Text className="flex-1 text-base font-semibold text-[#0a2540] ml-1">Subscription</Text>
      </View>
    </View>
  );

  // Loading state
  if (query.isLoading) {
    return (
      <View className="flex-1 bg-[#f6f9fc]">
        {Header}
        <ScrollView className="px-4 pt-4">
          <SkeletonLoader height={140} borderRadius={16} className="mb-4" />
          <SkeletonLoader height={120} borderRadius={16} className="mb-4" />
          <SkeletonLoader height={100} borderRadius={16} className="mb-4" />
        </ScrollView>
      </View>
    );
  }

  // Error state
  if (query.isError) {
    return (
      <View className="flex-1 bg-[#f6f9fc]">
        {Header}
        <ErrorView
          message={query.error?.message ?? 'Failed to load subscription.'}
          onRetry={() =>
            queryClient.invalidateQueries({ queryKey: ['subscription', orgId, id] })
          }
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f6f9fc]">
      {Header}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
      >
        {/* Header card */}
        <View className="bg-white rounded-lg p-5 mb-4 items-center">
          <Badge label={sub?.status ?? '—'} variant={statusVariant(sub?.status)} />
          <Text className="text-lg font-semibold text-[#0a2540] mt-3" numberOfLines={1}>
            {sub?.customer?.name ?? sub?.customerId}
          </Text>
          <Text className="text-sm text-[#6b7c93] mt-0.5">{sub?.plan?.name ?? 'Custom plan'}</Text>
          <Text className="text-xs text-[#8898aa] mt-1">
            {fmtDate(sub?.currentPeriodStart)} – {fmtDate(sub?.currentPeriodEnd)}
          </Text>
        </View>

        {/* Billing section */}
        <SectionCard title="Billing">
          <DetailRow label="Current period start" value={fmtDate(sub?.currentPeriodStart)} />
          <DetailRow label="Current period end" value={fmtDate(sub?.currentPeriodEnd)} />
          <DetailRow label="Amount per period" value={periodAmount(sub)} />
          <DetailRow label="Billing interval" value={billingInterval(sub)} />
        </SectionCard>

        {/* Timeline / Activity */}
        <SectionCard title="Activity">
          <DetailRow label="Created" value={fmtDate(sub?.createdAt)} />
          {sub?.canceledAt ? (
            <DetailRow label="Canceled" value={fmtDate(sub.canceledAt)} />
          ) : null}
          {sub?.cancelAtPeriodEnd ? (
            <DetailRow label="Cancel at period end" value="Yes" />
          ) : null}
        </SectionCard>

        {/* Actions */}
        {sub?.status === 'ACTIVE' ? (
          <TouchableOpacity
            className="bg-white rounded-lg border border-[#c41e3a] py-3 items-center"
            onPress={confirmCancel}
            disabled={cancelMutation.isPending}
            activeOpacity={0.7}
          >
            <Text className="text-sm font-medium text-[#c41e3a]">
              {cancelMutation.isPending ? 'Canceling…' : 'Cancel subscription'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}
