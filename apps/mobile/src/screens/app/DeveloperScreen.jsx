import { View } from 'react-native';
import { Code2 } from 'lucide-react-native';
import AppBar from '../../components/AppBar';
import EmptyView from '../../components/ui/EmptyView';

export default function DeveloperScreen() {
  return (
    <View className="flex-1 bg-[#f8fafc]">
      <AppBar title="Developer" />
      <EmptyView
        icon={Code2}
        title="Developer tools coming soon"
        description="API keys, webhooks, and logs will be available in the next module."
      />
    </View>
  );
}
