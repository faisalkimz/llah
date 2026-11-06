import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Building2, ChevronRight, LogOut, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuth from '../../hooks/useAuth';
import useOrganizations from '../../hooks/useOrganizations';
import AppBar from '../../components/AppBar';

export default function SettingsScreen() {
  const { user, orgName, logout, selectOrg } = useAuth();
  const { orgs } = useOrganizations();
  const [orgModal, setOrgModal] = useState(false);
  const insets = useSafeAreaInsets();

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? '?';

  async function handleLogout() {
    await logout();
  }

  async function handleSelectOrg(org) {
    await selectOrg(org.id, org.name);
    setOrgModal(false);
  }

  return (
    <View className="flex-1 bg-[#f6f9fc]">
      <AppBar title="Settings" />

      <View className="px-4 pt-6">
        {/* Avatar + name */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-[#3d4ed7] items-center justify-center mb-3">
            <Text className="text-white text-2xl font-bold">{initial}</Text>
          </View>
          <Text className="text-base font-semibold text-[#0a2540]">{user?.name ?? '—'}</Text>
          <Text className="text-sm text-[#6b7c93]">{user?.email ?? '—'}</Text>
        </View>

        {/* Org row */}
        <View className="bg-white rounded-lg overflow-hidden mb-4">
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

        {/* Sign out */}
        <View className="bg-white rounded-lg overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            onPress={handleLogout}
          >
            <LogOut size={18} color="#c41e3a" strokeWidth={1.5} />
            <Text className="text-sm font-medium text-red-500 ml-3">Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>

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
              keyExtractor={item => item.id}
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
    </View>
  );
}
