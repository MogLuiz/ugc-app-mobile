import { ChatConversationListScreen } from '@/modules/chat/components/ChatConversationListScreen'

export default function MensagensScreen() {
  return (
    <ChatConversationListScreen
      detailHrefBase="/(creator)/mensagens"
      emptyTitle="Você ainda não tem conversas"
      emptyDescription="Quando uma campanha for aceita, a conversa com a marca aparecerá aqui."
    />
  )
}
