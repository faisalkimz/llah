import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Plus, Trash2, Key, X, Copy, Check } from 'lucide-react-native';
import useAuth from '../../../hooks/useAuth';
import { getTokens } from '../../../store/auth';
import { getApiKeys, createApiKey, revokeApiKey } from '../../../api/developer';
import Badge from '../../../components/ui/Badge';
import SkeletonLoader from '../../../components/ui/SkeletonLoader';
import ErrorView from '../../../components/ui/ErrorView';

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Show a masked preview of the key using its stored prefix (first 12 chars + dots).
function maskPrefix(prefix) {
  const p = (prefix ?? '').slice(0, 12);
  return `llah_${p}••••`;
}

export default function ApiKeysScreen({ navigation }) {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  const query = useQuery({
    queryKey: ['api-keys', orgId],
    queryFn: async () => {
      const { access } = await getTokens();
      return getApiKeys(access, orgId);
    },
    enabled: !!orgId,
    staleTime: 30_000,
  });

  const keys = Array.isArray(query.data) ? query.data : [];

  const createMutation = useMutation({
    mutationFn: async () => {
      const { access } = await getTokens();
      return createApiKey(access, orgId, keyName.trim() || 'Untitled key');
    },
    onSuccess: (data) => {
      setCreatedKey(data?.key ?? null);
      setCopied(false);
    },
    onError: (error) => {
      Alert.alert('Could not create key', error?.message ?? 'Something went wrong. Please try again.');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (id) => {
      const { access } = await getTokens();
      return revokeApiKey(access, orgId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', orgId] });
    },
    onError: (error) => {
      Alert.alert('Could not revoke key', error?.message ?? 'Something went wrong. Please try again.');
    },
  });

  function openCreate() {
    setKeyName('');
    setCreatedKey(null);
    setCopied(false);
    setCreateOpen(true);
  }

  function closeCreate() {
    const hadNewKey = !!createdKey;
    setCreateOpen(false);
    setKeyName('');
    setCreatedKey(null);
    setCopied(false);
    if (hadNewKey) queryClient.invalidateQueries({ queryKey: ['api-keys', orgId] });
  }

  function confirmRevoke(keyItem) {
    Alert.alert(
      'Revoke this key?',
      'Any application using this key will immediately lose access. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Revoke', style: 'destructive', onPress: () => revokeMutation.mutate(keyItem.id) },
      ],
    );
  }

  function copyKey() {
    if (!createdKey) return;
    try {
      Clipboard.setString(createdKey);
      setCopied(true);
    } catch {
      Alert.alert('Copy failed', 'Long-press the key above to select and copy it manually.');
    }
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
        <Text className="flex-1 text-base font-semibold text-[#0a2540] ml-1">API Keys</Text>
        <TouchableOpacity
          onPress={openCreate}
          className="p-2"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Plus size={22} color="#0a2540" strokeWidth={1.5} />
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
            Select an organization to manage API keys
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
          message={query.error?.message ?? 'Failed to load API keys.'}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['api-keys', orgId] })}
        />
      </View>
    );
  }

  // Loading skeleton
  if (query.isLoading) {
    return (
      <View className="flex-1 bg-[#f6f9fc]">
        {Header}
        <View className="mx-4 mt-4 bg-white rounded-lg overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <View key={i} className="flex-row items-center px-4 py-3 border-b border-[#e3e8ee]">
              <View className="flex-1">
                <SkeletonLoader height={14} width="50%" borderRadius={6} />
                <SkeletonLoader height={11} width="45%" borderRadius={6} className="mt-1.5" />
                <SkeletonLoader height={11} width="30%" borderRadius={6} className="mt-1.5" />
              </View>
              <SkeletonLoader width={54} height={18} borderRadius={9} />
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
          data={keys}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="h-px bg-[#e3e8ee]" />}
          renderItem={({ item }) => {
            const revoked = item.status === 'REVOKED' || !!item.revokedAt;
            return (
              <View className="flex-row items-center px-4 py-3 bg-white">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-[#0a2540]" numberOfLines={1}>
                    {item.name ?? 'Untitled'}
                  </Text>
                  <Text className="text-xs font-mono text-[#6b7c93] mt-0.5" numberOfLines={1}>
                    {maskPrefix(item.prefix)}
                  </Text>
                  <Text className="text-xs text-[#8898aa] mt-0.5">{fmtDate(item.createdAt)}</Text>
                </View>
                <View className="items-end ml-2">
                  <Badge label={revoked ? 'REVOKED' : 'ACTIVE'} variant={revoked ? 'neutral' : 'success'} />
                  {!revoked ? (
                    <TouchableOpacity
                      onPress={() => confirmRevoke(item)}
                      className="mt-2 p-1"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={16} color="#c41e3a" strokeWidth={1.5} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center justify-center py-16 px-6">
              <Key size={48} color="#8898aa" strokeWidth={1.5} />
              <Text className="text-base font-medium text-[#0a2540] mt-4">No API keys</Text>
              <Text className="text-sm text-[#6b7c93] mt-1 text-center">Create your first API key</Text>
              <TouchableOpacity
                className="bg-[#0a2540] rounded-xl px-5 py-2.5 mt-5 flex-row items-center"
                onPress={openCreate}
              >
                <Plus size={16} color="#ffffff" strokeWidth={1.5} />
                <Text className="text-white text-sm font-medium ml-1.5">New API key</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>

      {/* Create / save key modal */}
      <Modal visible={createOpen} transparent animationType="slide" onRequestClose={closeCreate}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl px-4 pt-4" style={{ paddingBottom: insets.bottom + 16 }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-semibold text-[#0a2540]">
                {createdKey ? 'Save your key' : 'New API key'}
              </Text>
              <TouchableOpacity onPress={closeCreate}>
                <X size={20} color="#6b7c93" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>

            {createdKey ? (
              <View>
                <Text className="text-xs text-[#c41e3a] mb-3">
                  Copy your key now. It won't be shown again.
                </Text>
                <View className="bg-[#f6f9fc] border border-[#e3e8ee] rounded-lg p-3 mb-3">
                  <Text className="text-sm font-mono text-[#0a2540]" selectable>
                    {createdKey}
                  </Text>
                </View>
                <View className="flex-row">
                  <TouchableOpacity
                    className="flex-1 bg-[#3d4ed7] rounded-lg py-3 items-center mr-2 flex-row justify-center"
                    onPress={copyKey}
                    activeOpacity={0.8}
                  >
                    {copied ? (
                      <Check size={16} color="#ffffff" strokeWidth={1.5} />
                    ) : (
                      <Copy size={16} color="#ffffff" strokeWidth={1.5} />
                    )}
                    <Text className="text-white text-sm font-medium ml-1.5">
                      {copied ? 'Copied' : 'Copy'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-[#0a2540] rounded-lg py-3 items-center"
                    onPress={closeCreate}
                    activeOpacity={0.8}
                  >
                    <Text className="text-white text-sm font-medium">Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <Text className="text-xs text-[#6b7c93] mb-2">
                  Give your key a name to identify it later
                </Text>
                <TextInput
                  value={keyName}
                  onChangeText={setKeyName}
                  placeholder="e.g. Production server"
                  placeholderTextColor="#8898aa"
                  className="bg-[#f6f9fc] border border-[#e3e8ee] rounded-lg h-12 px-3 text-sm text-[#0a2540]"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  className="bg-[#3d4ed7] rounded-lg py-3 items-center mt-4"
                  onPress={() => createMutation.mutate()}
                  disabled={createMutation.isPending}
                  activeOpacity={0.8}
                >
                  {createMutation.isPending ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-sm font-medium text-white">Create</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
