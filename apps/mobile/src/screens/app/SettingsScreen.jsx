import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {
  Building2,
  ChevronRight,
  LogOut,
  X,
  Bell,
  Monitor,
  Lock,
  Github,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useOrganizations from '../../hooks/useOrganizations';
import { getTokens } from '../../store/auth';
import { getSessions } from '../../api/auth';
import { getUnreadCount } from '../../api/notifications';
import AppBar from '../../components/AppBar';
import Badge from '../../components/ui/Badge';

const APP_VERSION = '1.0.0';
const REPO_URL = 'https://github.com/faisalkimz/llah';

function fmtDateTime(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SectionLabel({ children }) {
  return (
    <Text className="text-xs font-medium text-[#8898aa] uppercase tracking-wide mb-2 mt-5 px-1">
      {children}
    </Text>
  );
}

export default function SettingsScreen({ navigation }) {
  const { user, orgName, logout, selectOrg, orgId } = useAuth();
  const { orgs } = useOrganizations();
  const insets = useSafeAreaInsets();

  const [orgModal, setOrgModal] = useState(false);
  const [sessionsModal, setSessionsModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);

  const initial =
    user?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? '?';

  const unreadQuery = useQuery({
    queryKey: ['unread-count', orgId],
    queryFn: async () => {
      const { access } = await getTokens();
      return getUnreadCount(access, orgId);
    },
    enabled: !!orgId,
    staleTime: 15_000,
  });
  const unreadCount = unreadQuery.data?.count ?? 0;

  // Sessions are user-scoped (token only, no org id). Fetch when the modal opens.
  const sessionsQuery = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { access } = await getTokens();
      return getSessions(access);
    },
    enabled: sessionsModal,
    staleTime: 0,
  });
  const sessions = Array.isArray(sessionsQuery.data) ? sessionsQuery.data : [];

  async function handleLogout() {
    await logout();
  }

  async function handleSelectOrg(org) {
    await selectOrg(org.id, org.name);
    setOrgModal(false);
  }

  function openGitHub() {
    Linking.openURL(REPO_URL).catch(() => {});
  }

  return (
    <View className="flex-1 bg-[#f6f9fc]">
      <AppBar title="Settings" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 }}
      >
        {/* Avatar + name */}
        <View className="items-center mb-2">
          <View className="w-16 h-16 rounded-full bg-[#3d4ed7] items-center justify-center mb-3">
            <Text className="text-white text-2xl font-bold">{initial}</Text>
          </View>
          <Text className="text-base font-semibold text-[#0a2540]">{user?.name ?? '—'}</Text>
          <Text className="text-sm text-[#6b7c93]">{user?.email ?? '—'}</Text>
        </View>

        {/* Organization */}
        <SectionLabel>Organization</SectionLabel>
        <View className="bg-white rounded-lg overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            onPress={() => setOrgModal(true)}
          >
            <Building2 size={18} color="#6b7c93" strokeWidth={1.5} />
            <View className="flex-1 ml-3">
              <Text className="text-xs text-[#6b7c93]">Organization</Text>
              <Text className="text-sm font-medium text-[#0a2540]">{orgName ?? 'Not selected'}</Text>
            </View>
            <ChevronRight size={16} color="#8898aa" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {/* Account */}
        <SectionLabel>Account</SectionLabel>
        <View className="bg-white rounded-lg overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center px-4 py-4 border-b border-[#e3e8ee]"
            onPress={() => navigation.navigate('Notifications')}
          >
            <Bell size={18} color="#6b7c93" strokeWidth={1.5} />
            <Text className="text-sm font-medium text-[#0a2540] flex-1 ml-3">Notifications</Text>
            {unreadCount > 0 ? (
              <View className="mr-2">
                <Badge label={String(unreadCount)} variant="info" />
              </View>
            ) : null}
            <ChevronRight size={16} color="#8898aa" strokeWidth={1.5} />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            onPress={() => setSessionsModal(true)}
          >
            <Monitor size={18} color="#6b7c93" strokeWidth={1.5} />
            <Text className="text-sm font-medium text-[#0a2540] flex-1 ml-3">Sessions</Text>
            <ChevronRight size={16} color="#8898aa" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {/* Security */}
        <SectionLabel>Security</SectionLabel>
        <View className="bg-white rounded-lg overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            onPress={() => setPasswordModal(true)}
          >
            <Lock size={18} color="#6b7c93" strokeWidth={1.5} />
            <Text className="text-sm font-medium text-[#0a2540] flex-1 ml-3">Change password</Text>
            <ChevronRight size={16} color="#8898aa" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {/* Sign out */}
        <View className="bg-white rounded-lg overflow-hidden mt-5">
          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            onPress={handleLogout}
          >
            <LogOut size={18} color="#c41e3a" strokeWidth={1.5} />
            <Text className="text-sm font-medium text-red-500 ml-3">Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <SectionLabel>About</SectionLabel>
        <View className="bg-white rounded-lg overflow-hidden">
          <View className="flex-row items-center px-4 py-4 border-b border-[#e3e8ee]">
            <Text className="text-sm font-medium text-[#0a2540] flex-1">App version</Text>
            <Text className="text-sm text-[#6b7c93]">{APP_VERSION}</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            onPress={openGitHub}
          >
            <Github size={18} color="#6b7c93" strokeWidth={1.5} />
            <Text className="text-sm font-medium text-[#0a2540] flex-1 ml-3">View on GitHub</Text>
            <ChevronRight size={16} color="#8898aa" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Org switcher modal */}
      <Modal
        visible={orgModal}
        transparent
        animationType="slide"
        onRequestClose={() => setOrgModal(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View
            className="bg-white rounded-t-3xl px-4 pt-4"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-semibold text-[#0a2540]">Switch organization</Text>
              <TouchableOpacity onPress={() => setOrgModal(false)}>
                <X size={20} color="#6b7c93" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={orgs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="py-3.5 border-b border-[#e3e8ee]"
                  onPress={() => handleSelectOrg(item)}
                >
                  <Text className="text-sm text-[#0a2540]">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Sessions modal */}
      <Modal
        visible={sessionsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSessionsModal(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View
            className="bg-white rounded-t-3xl px-4 pt-4"
            style={{ paddingBottom: insets.bottom + 16, maxHeight: '70%' }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-semibold text-[#0a2540]">Active sessions</Text>
              <TouchableOpacity onPress={() => setSessionsModal(false)}>
                <X size={20} color="#6b7c93" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
            {sessionsQuery.isLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="small" color="#3d4ed7" />
              </View>
            ) : sessionsQuery.isError ? (
              <View className="py-8 items-center">
                <Text className="text-sm text-[#6b7c93] text-center">
                  Could not load sessions.
                </Text>
              </View>
            ) : sessions.length === 0 ? (
              <View className="py-8 items-center">
                <Text className="text-sm text-[#6b7c93]">No active sessions</Text>
              </View>
            ) : (
              <FlatList
                data={sessions}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <View className="h-px bg-[#e3e8ee]" />}
                renderItem={({ item, index }) => (
                  <View className="py-3.5">
                    <Text className="text-sm font-medium text-[#0a2540]">
                      Session {index === 0 ? '(this device)' : `#${index + 1}`}
                    </Text>
                    <Text className="text-xs text-[#6b7c93] mt-0.5">
                      Created {fmtDateTime(item.createdAt)}
                    </Text>
                    <Text className="text-xs text-[#8898aa] mt-0.5">
                      Expires {fmtDateTime(item.expiresAt)}
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Change password modal (note only) */}
      <Modal
        visible={passwordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordModal(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View
            className="bg-white rounded-t-3xl px-4 pt-4"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-semibold text-[#0a2540]">Change password</Text>
              <TouchableOpacity onPress={() => setPasswordModal(false)}>
                <X size={20} color="#6b7c93" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-[#6b7c93]">
              Use the web app to change your password.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
