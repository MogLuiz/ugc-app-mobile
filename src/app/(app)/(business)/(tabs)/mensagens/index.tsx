import { ChatConversationListScreen } from '@/modules/chat/components/ChatConversationListScreen'

export default function BusinessMessagesScreen() {
  return (
    <ChatConversationListScreen
      detailHrefBase="/(business)/mensagens"
      emptyTitle="Sua empresa ainda não tem conversas"
      emptyDescription="Quando uma contratação avançar, as conversas com creators aparecerão aqui."
    />
  )
}
