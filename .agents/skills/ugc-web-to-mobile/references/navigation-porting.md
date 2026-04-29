# Navigation: React Router → Expo Router

## Regra Principal

Sempre verificar as rotas reais existentes em `src/app/` antes de navegar. Nunca inventar rota nova sem criar o arquivo correspondente e atualizar o `_layout.tsx` que controla o grupo.

---

## Mapeamento de APIs

| React Router (web) | Expo Router (mobile) |
|---|---|
| `import { useNavigate, Link } from 'react-router'` | `import { router, useLocalSearchParams } from 'expo-router'` |
| `const navigate = useNavigate()` | `router` é um singleton, importar direto |
| `navigate('/dashboard')` | `router.replace('/(app)/(tabs)')` |
| `navigate('/rota')` | `router.push('/rota')` |
| `navigate(-1)` | `router.back()` |
| `<Link to="/sign-up">` | `<Pressable onPress={() => router.push('/sign-up')}>` |
| `useSearchParams()` | `useLocalSearchParams()` |
| `useParams()` | `useLocalSearchParams()` |

---

## Rotas Reais do Projeto

**Verificar sempre em `src/app/` antes de navegar. Estrutura atual:**

```
src/app/
├── sign-in.tsx          → rota: '/sign-in'
├── sign-up.tsx          → rota: '/sign-up'
└── (app)/
    └── (tabs)/
        ├── index.tsx    → rota: '/(app)/(tabs)' ou '/(app)/(tabs)/index'
        ├── notifications.tsx → rota: '/(app)/(tabs)/notifications'
        └── profile.tsx  → rota: '/(app)/(tabs)/profile'
```

**Navegações comuns:**
```tsx
// Após login/cadastro bem-sucedido
router.replace('/(app)/(tabs)')

// Ir para sign-up a partir do sign-in
router.push('/sign-up')

// Voltar
router.back()
```

---

## Protected Routes

O `_layout.tsx` raiz controla acesso. Padrão existente:

```tsx
// src/app/_layout.tsx
import { Redirect } from 'expo-router'

// Se não autenticado, redireciona para sign-in
if (!isAuthenticated) {
  return <Redirect href="/sign-in" />
}
```

Nunca recriar essa lógica dentro das telas — ela já existe no layout.

---

## Adicionando Nova Rota

Se a tela portada precisa de uma rota nova:

1. Criar o arquivo em `src/app/` (ou subgrupo correto)
2. Verificar se o `_layout.tsx` do grupo precisa ser atualizado
3. Para rotas dinâmicas: `src/app/post/[id].tsx` → `useLocalSearchParams<{ id: string }>()`

**Nunca navegar para uma rota sem criar o arquivo primeiro.**

---

## Passagem de Parâmetros

**Web:**
```tsx
navigate(`/profile/${userId}`)
// ou
navigate('/search', { state: { query } })
```

**Mobile:**
```tsx
// Parâmetro na rota
router.push(`/profile/${userId}`)
// Leitura:
const { id } = useLocalSearchParams<{ id: string }>()

// Query string
router.push({ pathname: '/search', params: { query } })
// Leitura:
const { query } = useLocalSearchParams<{ query: string }>()
```

---

## Link como Componente

**Web:**
```tsx
<Link to="/esqueci-senha" className="text-purple-600">
  Esqueci minha senha
</Link>
```

**Mobile:**
```tsx
<Pressable onPress={() => router.push('/forgot-password')}>
  <Text style={styles.link}>Esqueci minha senha</Text>
</Pressable>
```

---

## Navegação após Submit

Padrão do projeto (baseado em sign-in/sign-up existentes):

```tsx
// Substituir stack — usuário não deve voltar para login
router.replace('/(app)/(tabs)')

// Adicionar ao stack — usuário pode voltar
router.push('/alguma-tela')

// Voltar com resultado (não usar estado, preferir re-fetch)
router.back()
```

**Regra:** Após auth bem-sucedida → sempre `router.replace` (não push).
