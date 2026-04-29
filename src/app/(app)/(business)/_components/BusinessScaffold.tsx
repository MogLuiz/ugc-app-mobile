import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppScreenHeader } from '@/components/AppScreenHeader'
import { colors } from '@/theme/colors'

export function BusinessScaffold({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppScreenHeader title={title} />
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  )
}

export function BusinessSectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>
}

export function BusinessCard({
  title,
  description,
  trailing,
}: {
  title: string
  description: string
  trailing?: ReactNode
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      {trailing}
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  subtitle: {
    marginTop: -4,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary.light,
  },
  body: {
    marginTop: 18,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text.primary.light,
  },
  card: {
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: 'rgba(137,90,246,0.08)',
    padding: 16,
    gap: 12,
  } as object,
  cardContent: {
    gap: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.text.secondary.light,
  },
})
