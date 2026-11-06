import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Activity, X } from 'lucide-react-native';
import useAuth from '../../../hooks/useAuth';
import { getTokens } from '../../../store/auth';
import { getEvents } from '../../../api/developer';
import SkeletonLoader from '../../../components/ui/SkeletonLoader';
import ErrorView from '../../../components/ui/ErrorView';
import DetailRow from '../../../components/ui/DetailRow';

const PAGE = 20;

function fmtDateTime(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EventLogScreen({ navigation }) {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [offset, setOffset] = useState(0);
  const [allEvents, setAllEvents] = useState([]);
  const [selected, setSelected] = useState(null);

  const query = useQuery({
    queryKey: ['event-log', orgId, offset],
    queryFn: async () => {
      const { access } = await getTokens();
      return getEvents(access, orgId, { limit: PAGE, offset });
    },
    enabled: !!orgId,
    staleTime: 30_000,
  });

  // Merge each page into the accumulated list.
  useEffect(() => {
    if (!query.data || query.isLoading || query.isError) return;
    const incoming = Array.isArray(query.data) ? query.data : [];
    setAllEvents((prev) => (offset === 0 ? incoming : [...prev, ...incoming]));
  }, [query.data, query.isLoading, query.isError, offset]);

  const hasMore = Array.isArray(query.data) && query.data.length === PAGE;

  function loadMore() {
    if (hasMore && !query.isFetching) setOffset((prev) => prev + PAGE);
  }

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
        <Text className="flex-1 text-base font-semibold text-[#0a2540] ml-1">Event log</Text>
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
            Select an organization to view events
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (query.isError && allEvents.length === 0) {
    return (
      <View className="flex-1 bg-[#f6f9fc]">
        {Header}
        <ErrorView
          message={query.error?.message ?? 'Failed to load events.'}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['event-log', orgId] })}
        />
      </View>
    );
  }

  // Loading skeleton
  if (query.isLoading && allEvents.length === 0) {
    return (
      <View className="flex-1 bg-[#f6f9fc]">
        {Header}
        <View className="mx-4 mt-4 bg-white rounded-lg overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <View key={i} className="flex-row items-center px-4 py-3 border-b border-[#e3e8ee]">
              <View className="flex-1">
                <SkeletonLoader height={14} width="55%" borderRadius={6} />
                <SkeletonLoader height={11} width="40%" borderRadius={6} className="mt-1.5" />
              </View>
              <SkeletonLoader width={70} height={11} borderRadius={6} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f6f9fc]">
      {Header}
      <View className="mx-4 mt-4 flex-1 bg-white rounded-lg overflow-hidden">
        <FlatList
          data={allEvents}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="h-px bg-[#e3e8ee]" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 bg-white"
              onPress={() => setSelected(item)}
              activeOpacity={0.7}
            >
              <View className="flex-1">
                <Text className="text-sm font-mono text-[#3d4ed7]" numberOfLines={1}>
                  {item.action}
                </Text>
                <Text className="text-xs text-[#6b7c93] mt-0.5" numberOfLines={1}>
                  {item.targetType ? `${item.targetType}` : '—'}
                  {item.targetId ? ` · ${item.targetId}` : ''}
                </Text>
              </View>
              <Text className="text-xs text-[#8898aa] ml-2">{fmtDateTime(item.createdAt)}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !query.isLoading ? (
              <View className="items-center justify-center py-16 px-6">
                <Activity size={48} color="#8898aa" strokeWidth={1.5} />
                <Text className="text-base font-medium text-[#0a2540] mt-4">No events yet</Text>
                <Text className="text-sm text-[#6b7c93] mt-1 text-center">
                  Platform activity will appear here
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            hasMore ? (
              <TouchableOpacity className="items-center py-4" onPress={loadMore}>
                {query.isFetching && offset > 0 ? (
                  <ActivityIndicator size="small" color="#3d4ed7" />
                ) : (
                  <Text className="text-sm text-[#3d4ed7] font-medium">Load more</Text>
                )}
              </TouchableOpacity>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>

      {/* Event details modal */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View
            className="bg-white rounded-t-3xl px-4 pt-4"
            style={{ paddingBottom: insets.bottom + 16, maxHeight: '80%' }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base font-semibold text-[#0a2540]">Event details</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <X size={20} color="#6b7c93" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
            {selected ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="bg-white rounded-lg overflow-hidden border border-[#e3e8ee]">
                  <DetailRow label="Action" value={selected.action} mono />
                  <DetailRow label="Target type" value={selected.targetType ?? '—'} />
                  <DetailRow label="Target ID" value={selected.targetId ?? '—'} mono />
                  <DetailRow label="Actor user" value={selected.actorUserId ?? '—'} mono />
                  <DetailRow label="Created" value={fmtDateTime(selected.createdAt)} />
                  <DetailRow label="Event ID" value={selected.id} mono />
                  <View className="px-4 py-3 border-b border-[#e3e8ee]">
                    <Text className="text-sm text-[#6b7c93] mb-1">Metadata</Text>
                    <Text className="text-xs font-mono text-[#0a2540]">
                      {selected.metadata ? JSON.stringify(selected.metadata) : '—'}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}
