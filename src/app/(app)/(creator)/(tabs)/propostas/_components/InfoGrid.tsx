import { StyleSheet, Text, View } from 'react-native'
import { formatDurationMinutes, formatTimeRange } from '@/lib/formatters'
import type { ContractRequestItem } from '@/modules/contract-requests/types'

type Props = {
  item: ContractRequestItem
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.value} numberOfLines={2}>
        {value}
      </Text>
    </View>
  )
}

export function InfoGrid({ item }: Props) {
  const isRemote = item.mode === 'REMOTE'

  const localValue = isRemote ? 'Remoto' : (item.jobFormattedAddress ?? item.jobAddress) || '—'

  const distanceValue = item.creatorDistance?.formatted ?? (isRemote ? 'Remoto' : '—')

  const dateValue = new Date(item.startsAt).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  })

  const cells: { label: string; value: string }[] = [
    { label: 'Tipo', value: item.jobTypeName ?? 'Serviço' },
    { label: 'Duração', value: formatDurationMinutes(item.durationMinutes) },
    { label: 'Data', value: dateValue },
    { label: 'Horário', value: formatTimeRange(item.startsAt, item.durationMinutes) },
    { label: 'Local', value: localValue },
    { label: 'Distância', value: distanceValue },
  ]

  return (
    <View style={styles.container}>
      {cells.map((cell, index) => (
        <View
          key={cell.label}
          style={[
            styles.cellWrapper,
            index % 2 === 1 && styles.cellWrapperRight,
            index >= 2 && styles.cellWrapperBorderTop,
          ]}
        >
          <InfoCell label={cell.label} value={cell.value} />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
  },
  cellWrapper: {
    width: '50%',
    padding: 14,
    borderRightWidth: 0,
  },
  cellWrapperRight: {
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  cellWrapperBorderTop: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cell: {
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 18,
  },
})
