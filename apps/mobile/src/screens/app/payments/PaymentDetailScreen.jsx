import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuth from '../../../hooks/useAuth';
import { getTokens } from '../../../store/auth';
import { getPayment } from '../../../api/payments';
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

export default function PaymentDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const { orgId } = useAuth();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const query = useQuery({
    queryKey: ['payment', orgId, id],
    queryFn: async () => {
      const { access } = await getTokens();
      return getPayment(access, orgId, id);
    },
    enabled: !!orgId && !!id,
    staleTime: 30_000,
  });

  const payment = query.data;

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
        <Text className="flex-1 text-base font-semibold text-[#0a2540] ml-1">Payment</Text>
      </View>
    </View>
  );

  // Loading state
  if (query.isLoading) {
    return (
      <View className="flex-1 bg-[#f6f9fc]">
        {Header}
        <ScrollView className="px-4 pt-4">
          <SkeletonLoader height={130} borderRadius={16} className="mb-4" />
          <SkeletonLoader height={120} borderRadius={16} className="mb-4" />
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
          message={query.error?.message ?? 'Failed to load payment.'}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['payment', orgId, id] })}
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
          <Text className="text-2xl font-semibold text-[#0a2540] tabular-nums">
            {fmtCurrency(payment?.amountMinor)}
          </Text>
          <View className="mt-2">
            <Badge label={payment?.status ?? '—'} variant={statusVariant(payment?.status)} />
          </View>
          <Text className="text-sm text-[#6b7c93] mt-2 capitalize">
            {payment?.provider ?? '—'}
          </Text>
        </View>

        {/* Details */}
        <SectionCard title="Details">
          <DetailRow label="Payment ID" value={payment?.id ?? '—'} mono />
          <DetailRow label="Invoice ID" value={payment?.invoiceId ?? '—'} mono />
          <DetailRow label="Provider" value={payment?.provider ?? '—'} />
          {payment?.providerPaymentId ? (
            <DetailRow label="Provider payment ID" value={payment.providerPaymentId} mono />
          ) : null}
          <DetailRow label="Created" value={fmtDate(payment?.createdAt)} />
        </SectionCard>
      </ScrollView>
    </View>
  );
}
