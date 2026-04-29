import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { BusinessActionTile } from '../../_components/BusinessActionTile'
import { BusinessCard, BusinessScaffold, BusinessSectionTitle } from '../../_components/BusinessScaffold'
import { colors } from '@/theme/colors'

export default function BusinessCampaignsScreen() {
  const router = useRouter()

  return (
    <BusinessScaffold
      title="Campanhas"
      subtitle="Hub inicial para ofertas, contratos em andamento e evolução da stack da empresa."
    >
      <Pressable
        onPress={() => router.push('/(business)/campanhas/criar' as never)}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
      >
        <Text style={styles.primaryButtonText}>Criar campanha</Text>
      </Pressable>

      <BusinessSectionTitle>Fluxos preparados</BusinessSectionTitle>
      <BusinessActionTile
        icon="add-circle-outline"
        title="Nova campanha"
        description="Abre a stack de criação para evolução futura da oferta."
        onPress={() => router.push('/(business)/campanhas/criar' as never)}
      />
      <BusinessActionTile
        icon="document-text-outline"
        title="Detalhe de campanha"
        description="Abre um placeholder navegável para o detalhe `/ofertas/:id` do web."
        onPress={() => router.push('/(business)/campanhas/demo-campaign' as never)}
      />

      <BusinessCard
        title="Sem regras de negócio profundas nesta etapa"
        description="A fundação cobre a navegação entre index, criar e detalhe. O contrato real com `/company/offers/hub` entra depois."
      />
    </BusinessScaffold>
  )
}

const styles = StyleSheet.create({
  primaryButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonPressed: {
    opacity: 0.86,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
})
