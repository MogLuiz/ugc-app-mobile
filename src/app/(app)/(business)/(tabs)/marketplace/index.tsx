import { useRouter } from 'expo-router'
import { BusinessActionTile } from '../../_components/BusinessActionTile'
import { BusinessCard, BusinessScaffold, BusinessSectionTitle } from '../../_components/BusinessScaffold'

export default function BusinessMarketplaceScreen() {
  const router = useRouter()

  return (
    <BusinessScaffold
      title="Marketplace"
      subtitle="Placeholder estruturado para descoberta de creators e filtro por stack."
    >
      <BusinessSectionTitle>Rotas prontas</BusinessSectionTitle>
      <BusinessActionTile
        icon="person-outline"
        title="Abrir creator demo"
        description="Valida a navegação para o detalhe `/criador/:creatorId`."
        onPress={() => router.push('/(business)/marketplace/demo-creator' as never)}
      />

      <BusinessCard
        title="Integração futura"
        description="Na próxima etapa, esta tela pode consumir `/profiles/creators` e `/job-types` reaproveitando os contratos do web."
      />
    </BusinessScaffold>
  )
}
