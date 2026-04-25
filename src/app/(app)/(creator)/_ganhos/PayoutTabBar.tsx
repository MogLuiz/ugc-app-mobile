import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'
import theme from '@/theme/theme'

export type GanhosTab = 'a-receber' | 'recebido' | 'dados-pix'

const TABS: { id: GanhosTab; label: string }[] = [
  { id: 'a-receber', label: 'A receber' },
  { id: 'recebido', label: 'Recebido' },
  { id: 'dados-pix', label: 'Dados PIX' },
]

type Props = {
  activeTab: GanhosTab
  onTabChange: (tab: GanhosTab) => void
}

export function PayoutTabBar({ activeTab, onTabChange }: Props) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => (
        <Pressable
          key={tab.id}
          style={styles.tab}
          onPress={() => onTabChange(tab.id)}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === tab.id }}
        >
          <Text style={[styles.label, activeTab === tab.id && styles.labelActive]}>
            {tab.label}
          </Text>
          {activeTab === tab.id ? <View style={styles.indicator} /> : null}
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  labelActive: {
    color: colors.primary,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
  },
})
