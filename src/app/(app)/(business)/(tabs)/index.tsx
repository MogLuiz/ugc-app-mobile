import { UserMenuBottomSheet, type UserMenuAction } from '@/components/UserMenuBottomSheet'
import { useSession } from '@/hooks/useSession'
import { BusinessDashboardHeader } from '@/modules/business-dashboard/components/BusinessDashboardHeader'
import { BusinessDashboardKpiSection } from '@/modules/business-dashboard/components/BusinessDashboardKpiSection'
import { useBusinessDashboardKpis } from '@/modules/business-dashboard/hooks/useBusinessDashboardKpis'
import { useUnreadNotificationsCountQuery } from '@/modules/notifications/queries'
import { colors } from '@/theme/colors'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, RefreshControl, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function BusinessDashboardScreen() {
  const router = useRouter()
  const { user, signOut } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? 'Time'
  const unreadNotificationsQuery = useUnreadNotificationsCountQuery()
  const { items, isRefreshing, refreshAll } = useBusinessDashboardKpis()

  const menuActions: UserMenuAction[] = [
    {
      label: 'Perfil',
      icon: 'user',
      onPress: () => {
        setMenuOpen(false)
        router.push('/(business)/perfil' as never)
      },
    },
    {
      label: 'Financeiro',
      icon: 'dollar-sign',
      onPress: () => {
        setMenuOpen(false)
        router.push('/(business)/financeiro' as never)
      },
    },
    {
      label: 'Configurações',
      icon: 'settings',
      onPress: () => {
        setMenuOpen(false)
        router.push('/configuracoes' as never)
      },
    },
    {
      label: 'Sair',
      icon: 'log-out',
      danger: true,
      onPress: () => {
        setMenuOpen(false)
        signOut().catch(() => {
          Alert.alert('Erro ao sair', 'Não foi possível encerrar sua sessão. Tente novamente.')
        })
      },
    },
  ]

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshAll}
            tintColor={colors.primary}
          />
        }
      >
        <BusinessDashboardHeader
          title="Painel da empresa"
          subtitle="Campanhas, creators e oportunidades."
          userName={user?.name}
          avatarUrl={user?.avatarUrl}
          notificationCount={unreadNotificationsQuery.data?.count ?? 0}
          onPressNotifications={() => router.push('/(app)/notificacoes' as never)}
          onPressAvatar={() => setMenuOpen(true)}
        />

        <BusinessDashboardKpiSection items={items} />
      </ScrollView>

      <UserMenuBottomSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        userName={user?.name}
        avatarUrl={user?.avatarUrl}
        userRole={user?.role}
        actions={menuActions}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 24,
  },
})
