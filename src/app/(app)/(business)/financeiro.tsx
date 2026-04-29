import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BusinessCard, BusinessScaffold, BusinessSectionTitle } from './_components/BusinessScaffold'
import { colors } from '@/theme/colors'

export default function BusinessFinanceiroScreen() {
  const router = useRouter()

  return (
    <BusinessScaffold
      title="Financeiro"
      subtitle="Shell inicial para pagamentos, créditos e reembolsos da empresa."
    >
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
      >
        <Ionicons name="arrow-back" size={18} color={colors.text.primary.light} />
        <Text style={styles.backLabel}>Voltar</Text>
      </Pressable>

      <BusinessSectionTitle>Próximas integrações</BusinessSectionTitle>
      <BusinessCard
        title="Pagamentos"
        description="Esta stack já existe para evoluir a tela real de pagamentos da empresa sem mexer nas tabs."
      />
      <BusinessCard
        title="Créditos e reembolsos"
        description="Quando a integração entrar, esta rota poderá consumir os contratos do web em `/company-balance`."
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
