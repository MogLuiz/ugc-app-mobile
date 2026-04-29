import { useRouter } from 'expo-router'
import { Alert } from 'react-native'
import { BusinessActionTile } from '../../_components/BusinessActionTile'
import { BusinessCard, BusinessScaffold, BusinessSectionTitle } from '../../_components/BusinessScaffold'
import { useSession } from '@/hooks/useSession'

export default function BusinessProfileShellScreen() {
  const router = useRouter()
  const { user, signOut } = useSession()

  async function handleSignOut() {
    try {
      await signOut()
      router.replace('/sign-in')
    } catch {
      Alert.alert('Erro', 'Não foi possível sair agora. Tente novamente.')
    }
  }

  return (
    <BusinessScaffold
      title="Perfil"
      subtitle="Shell inicial da empresa com acessos secundários e saída segura."
    >
      <BusinessCard
        title={user?.name ?? 'Empresa'}
        description="A edição completa do perfil da empresa entra depois. Nesta fase, o foco é a navegação."
      />

      <BusinessSectionTitle>Acessos</BusinessSectionTitle>
      <BusinessActionTile
        icon="wallet-outline"
        title="Financeiro"
        description="Abre a stack dedicada fora das tabs."
        onPress={() => router.push('/(business)/financeiro' as never)}
      />
      <BusinessActionTile
        icon="settings-outline"
        title="Configurações"
        description="Reaproveita a tela compartilhada já existente no app."
        onPress={() => router.push('/configuracoes' as never)}
      />
      <BusinessActionTile
        icon="log-out-outline"
        title="Sair"
        description="Encerra a sessão atual e volta para o login."
        onPress={() => void handleSignOut()}
      />
    </BusinessScaffold>
  )
}
