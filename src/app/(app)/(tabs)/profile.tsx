import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useState } from 'react'
import { useSession } from '@/hooks/useSession'
import { colors } from '@/theme/colors'

export default function ProfileScreen() {
  const { user, signOut } = useSession()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          setLoading(true)
          try {
            await signOut()
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      {user && (
        <>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.role}>{user.role === 'creator' ? 'Creator' : 'Empresa'}</Text>
        </>
      )}

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.error} />
        ) : (
          <Text style={styles.signOutText}>Sair</Text>
        )}
      </TouchableOpacity>
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
    marginBottom: 24,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary.light,
  },
  email: {
    fontSize: 14,
    color: colors.text.secondary.light,
    marginTop: 4,
  },
  role: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  signOutButton: {
    marginTop: 40,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  signOutText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
})
