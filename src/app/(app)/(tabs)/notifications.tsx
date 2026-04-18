import { StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notificações</Text>
      <Text style={styles.subtitle}>Suas notificações aparecerão aqui</Text>
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
