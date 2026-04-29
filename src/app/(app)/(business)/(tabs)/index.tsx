import { useRouter } from 'expo-router'
import { BusinessActionTile, BusinessInfoPill } from '../_components/BusinessActionTile'
import { BusinessCard, BusinessScaffold, BusinessSectionTitle } from '../_components/BusinessScaffold'
import { useSession } from '@/hooks/useSession'

export default function BusinessDashboardScreen() {
  const router = useRouter()
  const { user } = useSession()
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? 'Time'

  return (
    <BusinessScaffold
      title="Início"
      subtitle={`Bem-vinda, ${firstName}. Esta é a base inicial da navegação da empresa no app.`}
    >
      <BusinessCard
        title="Dashboard em evolução"
        description="Nesta etapa, a tela foca em atalhos e estrutura. Os blocos operacionais do web entram nas próximas fases."
        trailing={<BusinessInfoPill>Fundação</BusinessInfoPill>}
      />

      <BusinessSectionTitle>Atalhos principais</BusinessSectionTitle>
      <BusinessActionTile
        icon="briefcase-outline"
        title="Campanhas"
        description="Ver ofertas, abrir detalhes e preparar a criação de novas campanhas."
        onPress={() => router.push('/(business)/campanhas' as never)}
      />
      <BusinessActionTile
        icon="compass-outline"
        title="Marketplace"
        description="Explorar creators e validar a futura navegação de detalhe."
        onPress={() => router.push('/(business)/marketplace' as never)}
      />
      <BusinessActionTile
        icon="wallet-outline"
        title="Financeiro"
        description="Abrir a stack fora das tabs para pagamentos, créditos e reembolsos."
        onPress={() => router.push('/(business)/financeiro' as never)}
      />

      <BusinessSectionTitle>Próximas entregas</BusinessSectionTitle>
      <BusinessCard
        title="Mensagens já reaproveitadas"
        description="A aba de mensagens usa o módulo mobile existente de chat com detalhe em stack."
      />
      <BusinessCard
        title="Shells preparados"
        description="Campanhas, marketplace, perfil e financeiro já têm rotas navegáveis para a evolução tela a tela."
      />
    </BusinessScaffold>
  )
}
