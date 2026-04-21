import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'

export default function BusinessTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary.light,
        tabBarStyle: { borderTopColor: colors.border.light },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
