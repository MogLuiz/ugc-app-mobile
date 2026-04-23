import { StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'

type Props = {
  title: string
}

export function AppScreenHeader({ title }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title.toUpperCase()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.secondary.light,
    letterSpacing: 2,
  },
})
