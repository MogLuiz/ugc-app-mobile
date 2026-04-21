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
  { name: 'propostas', title: 'Propostas', icon: 'document-text-outline', activeIcon: 'document-text' },
  { name: 'mensagens', title: 'Mensagens', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles' },
  { name: 'oportunidades', title: 'Oportunidades', icon: 'briefcase-outline', activeIcon: 'briefcase' },
  { name: 'agenda', title: 'Agenda', icon: 'calendar-outline', activeIcon: 'calendar' },
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
    </Tabs>
  )
}
