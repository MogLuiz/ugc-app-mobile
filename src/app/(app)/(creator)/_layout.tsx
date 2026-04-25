import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const ICON_SIZE = 22

export default function CreatorTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#895af6',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          borderTopColor: 'rgba(137,90,246,0.08)',
          borderTopWidth: 0.5,
          paddingTop: 6,
          paddingBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 0,
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="propostas"
        options={{
          title: 'Campanhas',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'briefcase' : 'briefcase-outline'} size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mensagens"
        options={{
          title: 'Mensagens',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="oportunidades" options={{ href: null }} />
      <Tabs.Screen name="ganhos" options={{ href: null }} />
    </Tabs>
  )
}
