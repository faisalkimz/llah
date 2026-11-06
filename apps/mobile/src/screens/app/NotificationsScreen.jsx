import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, CheckCheck, Bell, X } from 'lucide-react-native';
import useAuth from '../../hooks/useAuth';
import { getTokens } from '../../store/auth';
import {
  getNotifications,
  markNotificationRead,
  markAllRead,
} from '../../api/notifications';
import Badge from '../../components/ui/Badge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import ErrorView from '../../components/ui/ErrorView';

const FILTERS = [
  { key: 'all', label: 'All', read: '' },
  { key: 'unread', label: 'Unread', read: 'false' },
];

function fmtDateTime(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationsScreen({ navigation }) {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);

  const activeFilter = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const queryKey = ['notifications', orgId, filter];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const { access } = await getTokens();
      return getNotifications(access, orgId, { limit: 20, offset: 0, read: activeFilter.read });
    },
    enabled: !!orgId,
    staleTime: 30_000,
  });

  const notifications = Array.isArray(query.data) ? query.data : [];

  // Optimistically mark a single notification as read.
  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      const { access } = await getTokens();
      return markNotificationRead(access, orgId, id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications', orgId] });
      queryClient.setQueriesData({ queryKey: ['notifications', orgId] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((n) => (n.id === id ? { ...n, read: true } : n));
      });
    },
    onError: (_e, _id) => {
      // Best-effort: refetch to recover correct state.
      queryClient.invalidateQueries({ queryKey: ['notifications', orgId] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', orgId] });
      queryClient.invalidateQueries({ queryKey: ['unread-count', orgId] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: async () => {
      const { access } = await getTokens();
      return markAllRead(access, orgId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications', orgId] });
      queryClient.setQueriesData({ queryKey: ['notifications', orgId] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((n) => ({ ...n, read: true }));
      });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', orgId] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', orgId] });
      queryClient.invalidateQueries({ queryKey: ['unread-count', orgId] });
    },
  });

  function handleRowPress(item) {
    if (!item.read) markReadMutation.mutate(item.id);
    setSelected(item);
  }

  function handleMarkAll() {
    if (markAllMutation.isPending) return;
    markAllMutation.mutate();
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['notifications', orgId] });
    setRefreshing(false);
  }, [queryClient, orgId]);

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
        <Text className="flex-1 text-base font-semibold text-[#0a2540] ml-1">Notifications</Text>
        <TouchableOpacity
          onPress={handleMarkAll}
          disabled={markAllMutation.isPending || notifications.length === 0}
          className="p-2"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <CheckCheck size={22} color="#3d4ed7" strokeWidth={1.5} />
        </TouchableOpacity>
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
            Select an organization to view notifications
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (query.isError && !query.data) {
    return (
      <View className="flex-1 bg-[#f6f9fc]">
        {Header}
        <ErrorView
          message={query.error?.message ?? 'Failed to load notifications.'}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['notifications', orgId] })}
        />
      </View>
    );
  }

  // Loading skeleton
  if (query.isLoading) {
    return (
      <View className="flex-1 bg-[#f6f9fc]">
        {Header}
        <View className="mx-4 mt-3 bg-white rounded-lg overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <View key={i} className="px-4 py-3 border-b border-[#e3e8ee]">
              <SkeletonLoader height={14} width="60%" borderRadius={6} />
              <SkeletonLoader height={11} width="85%" borderRadius={6} className="mt-1.5" />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f6f9fc]">
      {Header}

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
      >
        {FILTERS.map((f) => {
          const activeFilterTab = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full mr-2 ${
                activeFilterTab ? 'bg-[#3d4ed7]' : 'bg-white border border-[#e3e8ee]'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  activeFilterTab ? 'text-white' : 'text-[#6b7c93]'
                }`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View className="mx-4 flex-1 bg-white rounded-lg overflow-hidden">
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3d4ed7" />
          }
          ItemSeparatorComponent={() => <View className="h-px bg-[#e3e8ee]" />}
          renderItem={({ item }) => {
            const unread = !item.read;
            return (
              <TouchableOpacity
                className={`px-4 py-3 ${unread ? 'bg-[#eef0fb] border-l-2 border-[#3d4ed7]' : 'bg-white'}`}
                onPress={() => handleRowPress(item)}
                activeOpacity={0.7}
              >
                <View className="flex-row">
                  <Text className="text-sm font-medium text-[#0a2540] flex-1 mr-2" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text className="text-xs text-[#8898aa]">{fmtDateTime(item.createdAt)}</Text>
                </View>
                <Text className="text-xs text-[#6b7c93] mt-0.5" numberOfLines={2}>
                  {item.message}
                </Text>
                <View className="mt-1.5">
                  <Badge label={item.type} variant="info" />
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            !query.isLoading ? (
              <View className="items-center justify-center py-16 px-6">
                <Bell size={48} color="#8898aa" strokeWidth={1.5} />
                <Text className="text-base font-medium text-[#0a2540] mt-4">No notifications</Text>
                <Text className="text-sm text-[#6b7c93] mt-1 text-center">
                  {filter === 'unread'
                    ? 'You are all caught up'
                    : 'Notifications will appear here'}
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>

      {/* Notification detail modal */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl px-4 pt-4" style={{ paddingBottom: insets.bottom + 16 }}>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-semibold text-[#0a2540] flex-1 mr-3" numberOfLines={2}>
                {selected?.title}
              </Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <X size={20} color="#6b7c93" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
            {selected ? (
              <View>
                <View className="flex-row items-center mb-3">
                  <Badge label={selected.type} variant="info" />
                  <Text className="text-xs text-[#8898aa] ml-2">{fmtDateTime(selected.createdAt)}</Text>
                </View>
                <Text className="text-sm text-[#0a2540]">{selected.message}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}
