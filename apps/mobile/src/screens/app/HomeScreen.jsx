import { ScrollView, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react-native';
import useAuth from '../../hooks/useAuth';
import {
  getRevenueStats,
  getSubscriptionCount,
  getOpenInvoiceCount,
  getFailedPayments,
  getNotifications,
} from '../../api/dashboard';
import { getTokens } from '../../store/auth';
import AppBar from '../../components/AppBar';
import StatCard from '../../components/ui/StatCard';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import ErrorView from '../../components/ui/ErrorView';
import Badge from '../../components/ui/Badge';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatCurrency(minor) {
  if (minor == null) return '—';
  const num = Number(minor) / 100;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
}

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function HomeScreen() {
  const { user, orgId, orgName } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const commonOpts = {
    enabled: !!orgId,
    staleTime: 30_000,
  };

  const revenue = useQuery({
    queryKey: ['revenue-stats', orgId],
    queryFn: async () => {
      const { access } = await getTokens();
      return getRevenueStats(access, orgId);
    },
    ...commonOpts,
  });

  const subs = useQuery({
    queryKey: ['active-subs', orgId],
    queryFn: async () => {
      const { access } = await getTokens();
      return getSubscriptionCount(access, orgId);
    },
    ...commonOpts,
  });

  const invoices = useQuery({
    queryKey: ['open-invoices', orgId],
    queryFn: async () => {
      const { access } = await getTokens();
      return getOpenInvoiceCount(access, orgId);
    },
    ...commonOpts,
  });

  const failed = useQuery({
    queryKey: ['failed-payments', orgId],
    queryFn: async () => {
      const { access } = await getTokens();
      return getFailedPayments(access, orgId);
    },
    ...commonOpts,
  });

  const notifs = useQuery({
    queryKey: ['notifications', orgId],
    queryFn: async () => {
      const { access } = await getTokens();
      return getNotifications(access, orgId);
    },
    ...commonOpts,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['revenue-stats', orgId] });
    await queryClient.invalidateQueries({ queryKey: ['active-subs', orgId] });
    await queryClient.invalidateQueries({ queryKey: ['open-invoices', orgId] });
    await queryClient.invalidateQueries({ queryKey: ['failed-payments', orgId] });
    await queryClient.invalidateQueries({ queryKey: ['notifications', orgId] });
    setRefreshing(false);
  }, [queryClient, orgId]);

  const hasError = revenue.error || subs.error || invoices.error || failed.error;

  const unreadCount = Array.isArray(notifs.data)
    ? notifs.data.filter(n => !n.readAt && !n.read).length
    : 0;

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const revenueData = revenue.data ?? {};
  const activeSubsCount = subs.data?.total ?? subs.data?.count ?? (Array.isArray(subs.data) ? subs.data.length : '—');
  const openInvoiceCount = invoices.data?.total ?? invoices.data?.count ?? (Array.isArray(invoices.data) ? invoices.data.length : '—');
  const failedList = Array.isArray(failed.data) ? failed.data : (failed.data?.payments ?? []);
  const notifList = Array.isArray(notifs.data) ? notifs.data : (notifs.data?.notifications ?? []);

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <AppBar
        title={`${greeting()}, ${firstName}`}
        subtitle={orgName ?? undefined}
        rightComponent={
          <TouchableOpacity className="relative p-1">
            <Bell size={22} color="#0f172a" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <View className="absolute top-0 right-0 bg-[#0ea5e9] rounded-full w-4 h-4 items-center justify-center">
                <Text className="text-white text-[9px] font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />
        }
      >
        {hasError && !refreshing && (
          <ErrorView
            message={hasError.message || 'Failed to load dashboard data.'}
            onRetry={() => queryClient.invalidateQueries()}
          />
        )}

        {/* Stat Cards */}
        <View className="pt-4 pb-2">
          <Text className="px-4 text-xs font-medium text-[#64748b] uppercase tracking-widest mb-3">
            Overview
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {revenue.isLoading ? (
              <>
                <SkeletonLoader width={140} height={80} borderRadius={16} className="mr-3" />
                <SkeletonLoader width={140} height={80} borderRadius={16} className="mr-3" />
              </>
            ) : (
              <>
                <StatCard
                  label="MRR"
                  value={formatCurrency(revenueData.mrrMinor)}
                  sub="Monthly recurring"
                />
                <StatCard
                  label="ARR"
                  value={formatCurrency(revenueData.arrMinor)}
                  sub="Annual run rate"
                />
              </>
            )}
            {subs.isLoading ? (
              <SkeletonLoader width={140} height={80} borderRadius={16} className="mr-3" />
            ) : (
              <StatCard label="Active Subs" value={String(activeSubsCount)} sub="Subscriptions" />
            )}
            {invoices.isLoading ? (
              <SkeletonLoader width={140} height={80} borderRadius={16} className="mr-3" />
            ) : (
              <StatCard label="Open Invoices" value={String(openInvoiceCount)} sub="Awaiting payment" />
            )}
          </ScrollView>
        </View>

        {/* Needs Attention */}
        <View className="mt-4 px-4">
          <Text className="text-xs font-medium text-[#64748b] uppercase tracking-widest mb-3">
            Needs attention
          </Text>
          {failed.isLoading ? (
            <>
              <SkeletonLoader height={56} borderRadius={12} className="mb-2" />
              <SkeletonLoader height={56} borderRadius={12} className="mb-2" />
            </>
          ) : failedList.length === 0 ? (
            <View className="bg-white rounded-2xl px-4 py-4 items-center">
              <Text className="text-sm text-[#64748b]">No failed payments</Text>
            </View>
          ) : (
            failedList.map((p, i) => (
              <View
                key={p.id ?? i}
                className="bg-white rounded-2xl px-4 py-3 mb-2 flex-row items-center justify-between"
              >
                <View>
                  <Text className="text-sm font-semibold text-[#0f172a]">
                    {formatCurrency(p.amountMinor ?? p.amount)}
                  </Text>
                  <Text className="text-xs text-[#64748b] mt-0.5">
                    {formatDate(p.createdAt ?? p.date)}
                  </Text>
                </View>
                <Badge label="FAILED" variant="danger" />
              </View>
            ))
          )}
        </View>

        {/* Notifications */}
        <View className="mt-4 px-4 pb-8">
          <Text className="text-xs font-medium text-[#64748b] uppercase tracking-widest mb-3">
            Notifications
          </Text>
          {notifs.isLoading ? (
            <>
              <SkeletonLoader height={64} borderRadius={12} className="mb-2" />
              <SkeletonLoader height={64} borderRadius={12} className="mb-2" />
            </>
          ) : notifList.length === 0 ? (
            <View className="bg-white rounded-2xl px-4 py-4 items-center">
              <Text className="text-sm text-[#64748b]">No recent notifications</Text>
            </View>
          ) : (
            notifList.map((n, i) => (
              <View
                key={n.id ?? i}
                className={`bg-white rounded-2xl px-4 py-3 mb-2 border-l-2 ${
                  n.readAt || n.read ? 'border-transparent' : 'border-[#0ea5e9]'
                }`}
              >
                <Text className="text-sm font-medium text-[#0f172a]">
                  {n.title ?? n.subject ?? 'Notification'}
                </Text>
                {(n.message ?? n.body) ? (
                  <Text className="text-xs text-[#64748b] mt-0.5" numberOfLines={2}>
                    {n.message ?? n.body}
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
