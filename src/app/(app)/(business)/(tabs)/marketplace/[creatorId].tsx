import { useLocalSearchParams, useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BusinessCard, BusinessScaffold } from '../../_components/BusinessScaffold'
import { colors } from '@/theme/colors'

export default function BusinessCreatorDetailScreen() {
  const router = useRouter()
  const { creatorId } = useLocalSearchParams<{ creatorId: string }>()

  return (
    <BusinessScaffold
      title="Creator"
      subtitle={`Placeholder navegável para o creator ${creatorId ?? 'sem-id'}.`}
    >
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
      >
        <Ionicons name="arrow-back" size={18} color={colors.text.primary.light} />
        <Text style={styles.backLabel}>Voltar</Text>
      </Pressable>

      <BusinessCard
        title="Perfil detalhado futuro"
        description="A tela real poderá reaproveitar o mesmo contrato do web para detalhe de creator, mantendo esta stack."
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
