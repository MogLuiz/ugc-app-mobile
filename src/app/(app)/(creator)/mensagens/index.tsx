import { StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'

export default function MensagensScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mensagens</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.light,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
})
