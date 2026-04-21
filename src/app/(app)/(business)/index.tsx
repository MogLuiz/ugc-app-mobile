import { StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'

export default function BusinessHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Em breve</Text>
      <Text style={styles.subtitle}>A área da empresa estará disponível em breve.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.light,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary.light,
    marginTop: 8,
    textAlign: 'center',
  },
})
