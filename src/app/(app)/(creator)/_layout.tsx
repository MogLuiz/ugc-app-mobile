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

// Order mirrors the web CreatorBottomNav: Início · Campanhas · Agenda · Mensagens · Perfil
const TABS: TabConfig[] = [
  { name: 'index', title: 'Início', icon: 'home-outline', activeIcon: 'home' },
  { name: 'propostas', title: 'Campanhas', icon: 'briefcase-outline', activeIcon: 'briefcase' },
  { name: 'agenda', title: 'Agenda', icon: 'calendar-outline', activeIcon: 'calendar' },
  { name: 'mensagens', title: 'Mensagens', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles' },
  { name: 'perfil', title: 'Perfil', icon: 'person-outline', activeIcon: 'person' },
]

export default function CreatorTabsLayout() {
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
      {/* Oportunidades: rota acessível via navegação, mas fora da tab bar */}
      <Tabs.Screen name="oportunidades" options={{ href: null }} />
    </Tabs>
  )
}
