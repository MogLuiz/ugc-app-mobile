import { useMemo } from 'react'
import { useConversationsQuery } from '@/modules/chat/queries'
import { useCompanyOffersHubQuery } from '../queries'
import { buildBusinessDashboardKpiValues } from '../adapters'
import type { BusinessDashboardKpiCardVm, BusinessDashboardKpisResult } from '../types'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  return 'Não foi possível carregar'
}

export function useBusinessDashboardKpis(): BusinessDashboardKpisResult {
  const companyOffersHubQuery = useCompanyOffersHubQuery()
  const conversationsQuery = useConversationsQuery()

  const items = useMemo<BusinessDashboardKpiCardVm[]>(() => {
    const values = buildBusinessDashboardKpiValues({
      hub: companyOffersHubQuery.data,
      conversations: conversationsQuery.data,
      now: new Date(),
    })

    const offersUnavailable = !companyOffersHubQuery.data && !!companyOffersHubQuery.error
    const offersLoading = !companyOffersHubQuery.data && companyOffersHubQuery.isLoading
    const conversationsUnavailable = !conversationsQuery.data && !!conversationsQuery.error
    const conversationsLoading = !conversationsQuery.data && conversationsQuery.isLoading

    return [
      {
        id: 'pending-applications',
        label: 'Para revisar',
        value: offersUnavailable ? null : values['pending-applications'],
        valueDisplay: offersUnavailable ? '—' : String(values['pending-applications']),
        subtitle: offersUnavailable
          ? getErrorMessage(companyOffersHubQuery.error)
          : values['pending-applications'] > 0
            ? 'Creators esperando sua decisão'
            : 'Nenhuma pendência',
        state: offersLoading ? 'loading' : offersUnavailable ? 'error' : 'ready',
        tone: !offersUnavailable && values['pending-applications'] > 0 ? 'highlight' : 'default',
        href: '/(business)/campanhas',
      },
      {
        id: 'unread-messages',
        label: 'Mensagens',
        value: conversationsUnavailable ? null : values['unread-messages'],
        valueDisplay: conversationsUnavailable ? '—' : String(values['unread-messages']),
        subtitle: conversationsUnavailable
          ? getErrorMessage(conversationsQuery.error)
          : values['unread-messages'] > 0
            ? 'Não lidas'
            : 'Tudo em dia',
        state: conversationsLoading ? 'loading' : conversationsUnavailable ? 'error' : 'ready',
        tone: !conversationsUnavailable && values['unread-messages'] > 0 ? 'highlight' : 'default',
        href: '/(business)/mensagens',
      },
      {
        id: 'active-campaigns',
        label: 'Ativas',
        value: offersUnavailable ? null : values['active-campaigns'],
        valueDisplay: offersUnavailable ? '—' : String(values['active-campaigns']),
        subtitle: offersUnavailable
          ? getErrorMessage(companyOffersHubQuery.error)
          : 'Campanhas em andamento',
        state: offersLoading ? 'loading' : offersUnavailable ? 'error' : 'ready',
        tone: 'default',
        href: '/(business)/campanhas',
      },
      {
        id: 'upcoming-recordings',
        label: 'Gravações',
        value: offersUnavailable ? null : values['upcoming-recordings'],
        valueDisplay: offersUnavailable ? '—' : String(values['upcoming-recordings']),
        subtitle: offersUnavailable
          ? getErrorMessage(companyOffersHubQuery.error)
          : 'Próximas gravações',
        state: offersLoading ? 'loading' : offersUnavailable ? 'error' : 'ready',
        tone: 'default',
        href: '/(business)/campanhas',
      },
    ]
  }, [
    companyOffersHubQuery.data,
    companyOffersHubQuery.error,
    companyOffersHubQuery.isLoading,
    conversationsQuery.data,
    conversationsQuery.error,
    conversationsQuery.isLoading,
  ])

  function refreshAll() {
    void companyOffersHubQuery.refetch()
    void conversationsQuery.refetch()
  }

  return {
    items,
    isRefreshing: companyOffersHubQuery.isRefetching || conversationsQuery.isRefetching,
    refreshAll,
  }
}
