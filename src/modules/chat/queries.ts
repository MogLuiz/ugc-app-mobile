import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatKeys } from '@/lib/query-keys'
import { getConversationMessages, getConversations, sendConversationMessage } from './service'

export function useConversationsQuery(contractRequestId?: string) {
  return useQuery({
    queryKey: chatKeys.conversations(contractRequestId),
    queryFn: () => getConversations({ contractRequestId }),
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  })
}

export function useConversationMessagesInfiniteQuery(conversationId?: string) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: ({ pageParam }) =>
      getConversationMessages(conversationId!, {
        cursor: pageParam ?? undefined,
        limit: 30,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(conversationId),
    refetchInterval: 7_000,
    refetchIntervalInBackground: false,
  })
}

export function useSendConversationMessageMutation(conversationId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => sendConversationMessage(conversationId!, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) })
      // Refresh conversation list so lastMessage + ordering update
      void queryClient.invalidateQueries({ queryKey: chatKeys.all })
    },
  })
}
