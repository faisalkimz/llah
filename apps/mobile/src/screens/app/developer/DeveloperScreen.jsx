import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Key, Activity, Webhook, ChevronRight } from 'lucide-react-native';
import useAuth from '../../../hooks/useAuth';
import { getTokens } from '../../../store/auth';
import { getDeveloperOverview, getWebhookEndpoints } from '../../../api/developer';
import AppBar from '../../../components/AppBar';

const CARDS = [
  { key: 'ApiKeys', Icon: Key, title: 'API Keys', desc: 'Manage your API keys and access tokens' },
  { key: 'EventLog', Icon: Activity, title: 'Event Log', desc: 'View all platform events and activity' },
  { key: 'Webhooks', Icon: Webhook, title: 'Webhooks', desc: 'Monitor webhook endpoints and deliveries' },
];

export default function DeveloperScreen({ navigation }) {
  const { orgId } = useAuth();

  // Overview provides apiKeyCount + totalUsageEvents. It may 404; we degrade to "—".
  const overview = useQuery({
    queryKey: ['developer-overview', orgId],
    queryFn: async () => {
      const { access } = await getTokens();
      return getDeveloperOverview(access, orgId);
    },
    enabled: !!orgId,
    staleTime: 30_000,
    retry: false,
  });

  // Overview has no webhook endpoint count, so derive it from the endpoints list.
  const endpoints = useQuery({
    queryKey: ['webhook-endpoints', orgId],
    queryFn: async () => {
      const { access } = await getTokens();
      return getWebhookEndpoints(access, orgId);
    },
    enabled: !!orgId,
    staleTime: 30_000,
    retry: false,
  });

  const apiKeyCount = overview.data?.apiKeyCount ?? '—';
  const totalEvents = overview.data?.totalUsageEvents ?? '—';
  const webhookCount = Array.isArray(endpoints.data) ? endpoints.data.length : '—';

  return (
    <View className="flex-1 bg-[#f6f9fc]">
      <AppBar title="Developer" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
      >
        {CARDS.map(({ key, Icon, title, desc }) => (
          <TouchableOpacity
            key={key}
            className="bg-white rounded-xl p-4 mb-3 flex-row items-center"
            onPress={() => navigation.navigate(key)}
            activeOpacity={0.7}
          >
            <View className="w-11 h-11 rounded-xl bg-[#eef0fb] items-center justify-center">
              <Icon size={22} color="#3d4ed7" strokeWidth={1.5} />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-[#0a2540]">{title}</Text>
              <Text className="text-xs text-[#6b7c93] mt-0.5">{desc}</Text>
            </View>
            <ChevronRight size={18} color="#8898aa" strokeWidth={1.5} />
          </TouchableOpacity>
        ))}

        {/* Quick stats */}
        <Text className="text-[13px] font-medium text-[#0a2540] mt-3 mb-2 px-1">Quick stats</Text>
        <View className="bg-white rounded-lg overflow-hidden">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#e3e8ee]">
            <Text className="text-sm text-[#6b7c93]">API Keys</Text>
            <Text className="text-sm font-semibold text-[#0a2540] tabular-nums">{apiKeyCount}</Text>
          </View>
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#e3e8ee]">
            <Text className="text-sm text-[#6b7c93]">Total events</Text>
            <Text className="text-sm font-semibold text-[#0a2540] tabular-nums">{totalEvents}</Text>
          </View>
          <View className="flex-row items-center justify-between px-4 py-3">
            <Text className="text-sm text-[#6b7c93]">Webhook endpoints</Text>
            <Text className="text-sm font-semibold text-[#0a2540] tabular-nums">{webhookCount}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
