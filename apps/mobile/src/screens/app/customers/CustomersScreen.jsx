import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, ChevronRight, Users, X } from 'lucide-react-native';
import useAuth from '../../../hooks/useAuth';
import { getTokens } from '../../../store/auth';
import { getCustomers } from '../../../api/customers';
import AppBar from '../../../components/AppBar';
import SkeletonLoader from '../../../components/ui/SkeletonLoader';
import ErrorView from '../../../components/ui/ErrorView';

export default function CustomersScreen({ navigation }) {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef(null);
  const [offset, setOffset] = useState(0);
  const [allCustomers, setAllCustomers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  function handleSearchChange(text) {
    setSearch(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(text);
      setOffset(0);
      setAllCustomers([]);
    }, 300);
  }

  const query = useQuery({
    queryKey: ['customers', orgId, debouncedSearch, offset],
    queryFn: async () => {
      const { access } = await getTokens();
      return getCustomers(access, orgId, { limit: 20, offset, search: debouncedSearch });
    },
    enabled: !!orgId,
    staleTime: 30_000,
  });

  // Merge data into allCustomers when query resolves
  React.useEffect(() => {
    if (!query.data || query.isLoading || query.isError) return;
    const incoming = Array.isArray(query.data)
      ? query.data
      : (query.data?.customers ?? []);
    setAllCustomers(prev => (offset === 0 ? incoming : [...prev, ...incoming]));
  }, [query.data, query.isLoading, query.isError, offset]);

  const total = query.data?.total ?? (Array.isArray(query.data) ? query.data.length : 0);
  const hasMore = total > offset + 20;

  const displayed = search
    ? allCustomers.filter(c => {
        const q = search.toLowerCase();
        return (
          (c.name ?? '').toLowerCase().includes(q) ||
          (c.email ?? '').toLowerCase().includes(q)
        );
      })
    : allCustomers;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setOffset(0);
    setAllCustomers([]);
    await queryClient.invalidateQueries({ queryKey: ['customers', orgId] });
    setRefreshing(false);
  }, [queryClient, orgId]);

  function loadMore() {
    if (hasMore && !query.isFetching) {
      setOffset(prev => prev + 20);
    }
  }

  // No-org state
  if (!orgId) {
    return (
      <View className="flex-1 bg-[#f8fafc] items-center justify-center px-6">
        <Text className="text-sm text-[#64748b] text-center">
          Select an organisation to view customers
        </Text>
      </View>
    );
  }

  // Error state
  if (query.isError && allCustomers.length === 0) {
    return (
      <View className="flex-1 bg-[#f8fafc]">
        <AppBar
          title="Customers"
          rightComponent={
            <TouchableOpacity onPress={() => navigation.navigate('CreateCustomer')}>
              <Plus size={22} color="#0f172a" strokeWidth={1.5} />
            </TouchableOpacity>
          }
        />
        <ErrorView
          message={query.error?.message ?? 'Failed to load customers.'}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['customers', orgId] })}
        />
      </View>
    );
  }

  // Loading skeleton
  if (query.isLoading && allCustomers.length === 0) {
    return (
      <View className="flex-1 bg-[#f8fafc]">
        <AppBar
          title="Customers"
          rightComponent={
            <TouchableOpacity onPress={() => navigation.navigate('CreateCustomer')}>
              <Plus size={22} color="#0f172a" strokeWidth={1.5} />
            </TouchableOpacity>
          }
        />
        <View className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <View key={i} className="flex-row items-center px-4 py-3 border-b border-[#e2e8f0]">
              <SkeletonLoader width={40} height={40} borderRadius={20} />
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
    <View className="flex-1 bg-[#f8fafc]">
      <AppBar
        title="Customers"
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate('CreateCustomer')}>
            <Plus size={22} color="#0f172a" strokeWidth={1.5} />
          </TouchableOpacity>
        }
      />

      {/* Search bar */}
      <View className="mx-4 mt-3 mb-2 bg-white border border-[#e2e8f0] rounded-xl h-11 px-3 flex-row items-center">
        <Search size={18} color="#64748b" strokeWidth={1.5} />
        <TextInput
          value={search}
          onChangeText={handleSearchChange}
          placeholder="Search customers…"
          placeholderTextColor="#94a3b8"
          className="flex-1 ml-2 text-sm text-[#0f172a]"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search ? (
          <TouchableOpacity onPress={() => handleSearchChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={16} color="#64748b" strokeWidth={1.5} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View className="mx-4 flex-1 bg-white rounded-2xl overflow-hidden">
        <FlatList
          data={displayed}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />
          }
          ItemSeparatorComponent={() => (
            <View className="h-px bg-[#e2e8f0]" style={{ marginLeft: 72 }} />
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 bg-white"
              onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 rounded-full bg-[#0ea5e9] items-center justify-center mr-3">
                <Text className="text-white font-semibold text-base">
                  {(item.name ?? '?')[0].toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-[#0f172a]" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-xs text-[#64748b] mt-0.5" numberOfLines={1}>
                  {item.email}
                </Text>
              </View>
              <ChevronRight size={18} color="#94a3b8" strokeWidth={1.5} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !query.isLoading ? (
              <View className="items-center justify-center py-16 px-6">
                <Users size={48} color="#94a3b8" strokeWidth={1.5} />
                <Text className="text-base font-medium text-[#0f172a] mt-4">No customers yet</Text>
                <Text className="text-sm text-[#64748b] mt-1 text-center">
                  Add your first customer to get started
                </Text>
                <TouchableOpacity
                  className="bg-[#0f172a] rounded-xl px-5 py-2.5 mt-5 flex-row items-center"
                  onPress={() => navigation.navigate('CreateCustomer')}
                >
                  <Plus size={16} color="#ffffff" strokeWidth={1.5} />
                  <Text className="text-white text-sm font-medium ml-1.5">Add customer</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
          ListFooterComponent={
            hasMore ? (
              <TouchableOpacity
                className="items-center py-4"
                onPress={loadMore}
              >
                {query.isFetching && offset > 0 ? (
                  <ActivityIndicator size="small" color="#0ea5e9" />
                ) : (
                  <Text className="text-sm text-[#0ea5e9] font-medium">Load more</Text>
                )}
              </TouchableOpacity>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </View>
  );
}
