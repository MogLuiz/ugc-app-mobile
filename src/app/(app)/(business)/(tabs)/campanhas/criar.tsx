import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BusinessCard, BusinessScaffold } from '../../_components/BusinessScaffold'
import { colors } from '@/theme/colors'

export default function BusinessCampaignCreateScreen() {
  const router = useRouter()

  return (
    <BusinessScaffold
      title="Criar"
      subtitle="Placeholder estruturado para a futura criação de campanhas da empresa."
    >
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
      >
        <Ionicons name="arrow-back" size={18} color={colors.text.primary.light} />
        <Text style={styles.backLabel}>Voltar</Text>
      </Pressable>

      <BusinessCard
        title="Próxima fase"
        description="Aqui entra o formulário de `open-offers` do web, preservando payloads e regras quando formos portar a tela real."
      />
    </BusinessScaffold>
  )
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  backButtonPressed: {
    opacity: 0.82,
  },
  backLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
})
