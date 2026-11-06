import React from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, CreditCard } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuth from '../../../hooks/useAuth';
import { getTokens } from '../../../store/auth';
import { getInvoice, finalizeInvoice, voidInvoice } from '../../../api/invoices';
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
    case 'PAID':
    case 'SUCCEEDED':
      return 'success';
    case 'OPEN':
      return 'info';
    case 'DRAFT':
      return 'warning';
    case 'VOID':
      return 'neutral';
    case 'UNCOLLECTIBLE':
      return 'danger';
    default:
      return 'neutral';
  }
}

export default function InvoiceDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const { orgId } = useAuth();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const query = useQuery({
    queryKey: ['invoice', orgId, id],
    queryFn: async () => {
      const { access } = await getTokens();
      return getInvoice(access, orgId, id);
    },
    enabled: !!orgId && !!id,
    staleTime: 30_000,
  });

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      const { access } = await getTokens();
      return finalizeInvoice(access, orgId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', orgId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', orgId, id] });
    },
    onError: (error) => {
      Alert.alert(
        'Could not finalize invoice',
        error?.message ?? 'Something went wrong. Please try again.',
      );
    },
  });

  const voidMutation = useMutation({
    mutationFn: async () => {
      const { access } = await getTokens();
      return voidInvoice(access, orgId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', orgId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', orgId, id] });
    },
    onError: (error) => {
      Alert.alert(
        'Could not void invoice',
        error?.message ?? 'Something went wrong. Please try again.',
      );
    },
  });

  function confirmFinalize() {
    Alert.alert(
      'Finalize invoice',
      'Finalizing will lock this invoice and mark it as open. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Finalize', onPress: () => finalizeMutation.mutate() },
      ]
    );
  }

  function confirmVoid() {
    Alert.alert(
      'Void invoice',
      'Voiding cancels this open invoice. This cannot be undone.',
      [
        { text: 'Keep', style: 'cancel' },
        { text: 'Void invoice', style: 'destructive', onPress: () => voidMutation.mutate() },
      ]
    );
  }

  const invoice = query.data;

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
        <Text className="flex-1 text-base font-semibold text-[#0a2540] ml-1" numberOfLines={1}>
          {invoice?.number ?? 'Invoice'}
        </Text>
      </View>
    </View>
  );

  // Loading state
  if (query.isLoading) {
    return (
      <View className="flex-1 bg-[#f6f9fc]">
        {Header}
        <ScrollView className="px-4 pt-4">
          <SkeletonLoader height={150} borderRadius={16} className="mb-4" />
          <SkeletonLoader height={110} borderRadius={16} className="mb-4" />
          <SkeletonLoader height={130} borderRadius={16} className="mb-4" />
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
          message={query.error?.message ?? 'Failed to load invoice.'}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['invoice', orgId, id] })}
        />
      </View>
    );
  }

  const lines = invoice?.lines ?? [];

  return (
    <View className="flex-1 bg-[#f6f9fc]">
      {Header}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
      >
        {/* Header card */}
        <View className="bg-white rounded-lg p-5 mb-4 items-center">
          <Text className="text-lg font-mono font-semibold text-[#0a2540]">
            {invoice?.number ?? '—'}
          </Text>
          <View className="mt-2">
            <Badge label={invoice?.status ?? '—'} variant={statusVariant(invoice?.status)} />
          </View>
          <Text className="text-2xl font-semibold text-[#0a2540] tabular-nums mt-3">
            {fmtCurrency(invoice?.totalMinor)}
          </Text>
        </View>

        {/* Details */}
        <SectionCard title="Details">
          <DetailRow label="Customer ID" value={invoice?.customerId ?? '—'} mono />
          <DetailRow label="Created" value={fmtDate(invoice?.createdAt)} />
          <DetailRow label="Finalized" value={fmtDate(invoice?.issuedAt)} />
        </SectionCard>

        {/* Line items */}
        <SectionCard title="Line items">
          <FlatList
            data={lines}
            scrollEnabled={false}
            keyExtractor={(item, idx) => item.id ?? String(idx)}
            renderItem={({ item }) => (
              <View className="px-4 py-3 border-b border-[#e3e8ee]">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-[#0a2540] flex-1 mr-2" numberOfLines={2}>
                    {item.description}
                  </Text>
                  <Text className="text-sm font-medium text-[#0a2540] tabular-nums">
                    {fmtCurrency(item.amountMinor)}
                  </Text>
                </View>
                <Text className="text-xs text-[#6b7c93] mt-0.5">
                  {Number(item.quantity)} × {fmtCurrency(item.unitAmountMinor)}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <View className="px-4 py-6 items-center">
                <Text className="text-sm text-[#6b7c93]">No line items</Text>
              </View>
            }
          />
        </SectionCard>

        {/* Totals */}
        <SectionCard title="Totals">
          <DetailRow label="Subtotal" value={fmtCurrency(invoice?.subtotalMinor)} />
          <DetailRow label="Total" value={fmtCurrency(invoice?.totalMinor)} />
        </SectionCard>

        {/* View payments */}
        <TouchableOpacity
          className="bg-white rounded-lg border border-[#e3e8ee] py-3 flex-row items-center justify-center mb-4"
          onPress={() => navigation.navigate('Payments')}
          activeOpacity={0.7}
        >
          <CreditCard size={16} color="#3d4ed7" strokeWidth={1.5} />
          <Text className="text-sm font-medium text-[#3d4ed7] ml-2">View payments</Text>
        </TouchableOpacity>

        {/* Actions */}
        {invoice?.status === 'DRAFT' ? (
          <TouchableOpacity
            className="bg-[#3d4ed7] rounded-lg py-3 items-center"
            onPress={confirmFinalize}
            disabled={finalizeMutation.isPending}
            activeOpacity={0.8}
          >
            <Text className="text-sm font-medium text-white">
              {finalizeMutation.isPending ? 'Finalizing…' : 'Finalize'}
            </Text>
          </TouchableOpacity>
        ) : null}
        {invoice?.status === 'OPEN' ? (
          <TouchableOpacity
            className="bg-white rounded-lg border border-[#c41e3a] py-3 items-center mt-3"
            onPress={confirmVoid}
            disabled={voidMutation.isPending}
            activeOpacity={0.7}
          >
            <Text className="text-sm font-medium text-[#c41e3a]">
              {voidMutation.isPending ? 'Voiding…' : 'Void'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}
