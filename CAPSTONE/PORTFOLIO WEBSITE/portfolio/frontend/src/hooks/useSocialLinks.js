import { useQuery } from '@tanstack/react-query'
import { fetchSocialLinks } from '../api/client'

export function useSocialLinks() {
  const { data } = useQuery({
    queryKey: ['social-links'],
    queryFn: fetchSocialLinks,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  })
  return data || {}
}
