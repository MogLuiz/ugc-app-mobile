import { StyleSheet, Text, View } from 'react-native'
import { useSession } from '@/hooks/useSession'
import { colors } from '@/theme/colors'

export default function HomeScreen() {
  const { user } = useSession()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Início</Text>
      {user ? (
        <Text style={styles.subtitle}>Olá, {user.name}</Text>
      ) : null}
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
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary.light,
    marginTop: 8,
  },
})
