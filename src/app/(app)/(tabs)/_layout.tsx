import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

type TabConfig = {
  name: string
  title: string
  icon: IoniconsName
  activeIcon: IoniconsName
}

const TABS: TabConfig[] = [
  { name: 'index', title: 'Início', icon: 'home-outline', activeIcon: 'home' },
  {
    name: 'notifications',
    title: 'Notificações',
    icon: 'notifications-outline',
    activeIcon: 'notifications',
  },
  { name: 'profile', title: 'Perfil', icon: 'person-outline', activeIcon: 'person' },
]

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary.light,
        tabBarStyle: { borderTopColor: colors.border.light },
      }}
    >
      {TABS.map(({ name, title, icon, activeIcon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? activeIcon : icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}
