import useSWR from 'swr';

export function useAuth() {
  return useSWR('/auth');
}
