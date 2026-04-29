import { StyleSheet, Text, View } from 'react-native'

type Props = {
  description?: string | null
}

export function BriefingSection({ description }: Props) {
  if (!description?.trim()) return null

  const lines = description.split('\n').filter((l) => l.trim())
  const bulletLines = lines.filter((l) => /^[•\-*]/.test(l.trim()))
  const mainLines = lines.filter((l) => !/^[•\-*]/.test(l.trim()))
  const mainDescription = mainLines.join(' ').trim()

  if (!mainDescription && bulletLines.length === 0) return null

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <View style={styles.dot} />
        <Text style={styles.headingText}>BRIEFING DO PROJETO</Text>
      </View>

      {mainDescription ? (
        <Text style={styles.mainText}>{mainDescription}</Text>
      ) : null}

      {bulletLines.length > 0 ? (
        <View style={styles.bullets}>
          {bulletLines.map((line, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{line.replace(/^[•\-*]\s*/, '')}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#895af6',
  },
  headingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  mainText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  bullets: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#895af6',
    marginTop: 7,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
})
