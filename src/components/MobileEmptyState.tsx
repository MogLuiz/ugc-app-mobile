import { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Props = {
  title: string
  description: string
  actions?: ReactNode
  icon?: ReactNode
  compact?: boolean
}

export function MobileEmptyState({ title, description, actions, icon, compact = false }: Props) {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {icon ? (
        <View style={[styles.iconWrap, compact && styles.iconWrapCompact]}>{icon}</View>
      ) : null}
      <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
      <Text style={[styles.description, compact && styles.descriptionCompact]}>{description}</Text>
      {actions ? (
        <View style={[styles.actions, compact && styles.actionsCompact]}>{actions}</View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  containerCompact: {
    paddingVertical: 12,
  },
  iconWrap: {
    marginBottom: 16,
  },
  iconWrapCompact: {
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
    color: '#0f172a',
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 16,
    letterSpacing: -0.3,
  },
  description: {
    marginTop: 8,
    maxWidth: 280,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#64748b',
  },
  descriptionCompact: {
    marginTop: 6,
    maxWidth: 240,
    fontSize: 12,
    lineHeight: 17,
  },
  actions: {
    width: '100%',
    marginTop: 20,
  },
  actionsCompact: {
    marginTop: 12,
  },
})
