import { useQuery } from '@tanstack/react-query';
import { getOrganizations } from '../api/organizations';
import useAuth from './useAuth';

export default function useOrganizations() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { getTokens } = await import('../store/auth');
      const { access } = await getTokens();
      return getOrganizations(access);
    },
    enabled: !!user,
  });

  const orgs = Array.isArray(data) ? data : (data?.organizations ?? []);
  return { orgs, isLoading, error };
}
