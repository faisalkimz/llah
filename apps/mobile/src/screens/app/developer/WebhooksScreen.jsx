import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Webhook, Send } from 'lucide-react-native';
import useAuth from '../../../hooks/useAuth';
import { getTokens } from '../../../store/auth';
import { getWebhookEndpoints, getWebhookDeliveries } from '../../../api/developer';
import Badge from '../../../components/ui/Badge';
import SkeletonLoader from '../../../components/ui/SkeletonLoader';

function fmtDateTime(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function deliveryVariant(s) {
  switch (s) {
    case 'SUCCEEDED':
      return 'success';
    case 'FAILED':
      return 'danger';
    case 'PENDING':
      return 'warning';
    default:
      return 'neutral';
  }
}

function SectionLabel({ children }) {
  return <Text className="text-[13px] font-medium text-[#0a2540] mb-2 px-1">{children}</Text>;
}

export default function WebhooksScreen({ navigation }) {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const endpointsQuery = useQuery({
    queryKey: ['webhook-endpoints', orgId],
    queryFn: async () => {
      const { access } = await getTokens();
      return getWebhookEndpoints(access, orgId);
    },
    enabled: !!orgId,
    staleTime: 30_000,
  });

  const deliveriesQuery = useQuery({
    queryKey: ['webhook-deliveries', orgId],
    queryFn: async () => {
      const { access } = await getTokens();
      return getWebhookDeliveries(access, orgId, { limit: 10 });
    },
    enabled: !!orgId,
    staleTime: 30_000,
  });

  const endpoints = Array.isArray(endpointsQuery.data) ? endpointsQuery.data : [];
  const deliveries = Array.isArray(deliveriesQuery.data) ? deliveriesQuery.data : [];

  const Header = (
    <View className="bg-white border-b border-[#e3e8ee] px-2 pb-3" style={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={22} color="#0a2540" strokeWidth={1.5} />
        </TouchableOpacity>
        <Text className="flex-1 text-base font-semibold text-[#0a2540] ml-1">Webhooks</Text>
      </View>
    </View>
  );

  // No-org state
  if (!orgId) {
    return (
      <View className="flex-1 bg-[#f6f9fc]">
        {Header}
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-sm text-[#6b7c93] text-center">
            Select an organization to view webhooks
          </Text>
        </View>
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
        {/* Endpoints */}
        <SectionLabel>Endpoints</SectionLabel>
        <View className="bg-white rounded-lg overflow-hidden mb-4">
          {endpointsQuery.isLoading ? (
            [...Array(3)].map((_, i) => (
              <View key={i} className="px-4 py-3 border-b border-[#e3e8ee]">
                <SkeletonLoader height={13} width="70%" borderRadius={6} />
                <View className="flex-row mt-2">
                  <SkeletonLoader width={64} height={18} borderRadius={9} />
                  <SkeletonLoader width={64} height={18} borderRadius={9} className="ml-2" />
                </View>
              </View>
            ))
          ) : endpointsQuery.isError ? (
            <View className="px-4 py-6 items-center">
              <Text className="text-sm text-[#6b7c93] text-center">Failed to load endpoints.</Text>
              <TouchableOpacity
                className="bg-[#0a2540] px-4 py-2 rounded-xl mt-3"
                onPress={() =>
                  queryClient.invalidateQueries({ queryKey: ['webhook-endpoints', orgId] })
                }
              >
                <Text className="text-white text-sm font-medium">Try again</Text>
              </TouchableOpacity>
            </View>
          ) : endpoints.length === 0 ? (
            <View className="items-center justify-center py-12 px-6">
              <Webhook size={40} color="#8898aa" strokeWidth={1.5} />
              <Text className="text-sm font-medium text-[#0a2540] mt-3">No webhook endpoints</Text>
              <Text className="text-xs text-[#6b7c93] mt-1 text-center">
                Endpoints you create will appear here
              </Text>
            </View>
          ) : (
            endpoints.map((ep, idx) => (
              <View
                key={ep.id}
                className={`px-4 py-3 ${idx < endpoints.length - 1 ? 'border-b border-[#e3e8ee]' : ''}`}
              >
                <Text className="text-sm text-[#0a2540] flex-1" numberOfLines={1}>
                  {ep.url}
                </Text>
                <View className="flex-row items-center mt-2">
                  <Badge
                    label={`${Array.isArray(ep.events) ? ep.events.length : 0} events`}
                    variant="neutral"
                  />
                  <View className="ml-2">
                    <Badge
                      label={ep.active ? 'ACTIVE' : 'INACTIVE'}
                      variant={ep.active ? 'success' : 'neutral'}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Recent deliveries */}
        <SectionLabel>Recent deliveries</SectionLabel>
        <View className="bg-white rounded-lg overflow-hidden">
          {deliveriesQuery.isLoading ? (
            [...Array(4)].map((_, i) => (
              <View key={i} className="flex-row items-center px-4 py-3 border-b border-[#e3e8ee]">
                <View className="flex-1">
                  <SkeletonLoader height={13} width="60%" borderRadius={6} />
                </View>
                <SkeletonLoader width={70} height={18} borderRadius={9} />
              </View>
            ))
          ) : deliveriesQuery.isError ? (
            <View className="px-4 py-6 items-center">
              <Text className="text-sm text-[#6b7c93] text-center">Failed to load deliveries.</Text>
              <TouchableOpacity
                className="bg-[#0a2540] px-4 py-2 rounded-xl mt-3"
                onPress={() =>
                  queryClient.invalidateQueries({ queryKey: ['webhook-deliveries', orgId] })
                }
              >
                <Text className="text-white text-sm font-medium">Try again</Text>
              </TouchableOpacity>
            </View>
          ) : deliveries.length === 0 ? (
            <View className="items-center justify-center py-12 px-6">
              <Send size={40} color="#8898aa" strokeWidth={1.5} />
              <Text className="text-sm font-medium text-[#0a2540] mt-3">No deliveries yet</Text>
              <Text className="text-xs text-[#6b7c93] mt-1 text-center">
                Recent webhook deliveries will appear here
              </Text>
            </View>
          ) : (
            deliveries.map((d, idx) => (
              <View
                key={d.id}
                className={`flex-row items-center px-4 py-3 ${
                  idx < deliveries.length - 1 ? 'border-b border-[#e3e8ee]' : ''
                }`}
              >
                <View className="flex-1">
                  <Text className="text-sm font-mono text-[#3d4ed7]" numberOfLines={1}>
                    {d.eventType}
                  </Text>
                </View>
                <View className="items-end ml-2">
                  <Badge label={d.status} variant={deliveryVariant(d.status)} />
                  <Text className="text-xs text-[#8898aa] mt-1">{fmtDateTime(d.createdAt)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
