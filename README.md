# UGC Local — Mobile App

App mobile do UGC Local, construído com Expo + React Native + TypeScript.

---

## Pré-requisitos

- Node.js 20+
- npm 10+
- iOS: Xcode 15+ e iOS Simulator
- Android: Android Studio e emulador configurado

---

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com as suas variáveis reais
```

### Variáveis de ambiente

| Variável | Descrição | Obrigatória |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | URL base da API (ex: `https://api.ugclocal.com`) | Sim |
| `EXPO_PUBLIC_APP_ENV` | Ambiente (`development`, `staging`, `production`) | Não (padrão: `development`) |
| `EAS_PROJECT_ID` | ID do projeto EAS (necessário para push notifications) | Para push |

> **Importante:** `.env.local` é ignorado pelo git. Nunca commite credenciais.

---

## Como rodar

### Dev server (Expo Go)

```bash
npx expo start
```

Abre o Metro Bundler. Escaneie o QR com o app **Expo Go** no celular, ou pressione:
- `i` — abrir no simulador iOS
- `a` — abrir no emulador Android
- `w` — abrir no navegador (web)

### Simulador iOS (requer Xcode)

```bash
npx expo run:ios
```

### Emulador Android (requer Android Studio)

```bash
npx expo run:android
```

---

## EAS Development Build

Para funcionalidades que precisam de módulos nativos (como push notifications), use um **development build** em vez do Expo Go.

```bash
# Login no EAS
npx eas login

# Criar development build
npx eas build --profile development --platform ios
# ou
npx eas build --profile development --platform android
```

Depois de instalado no dispositivo, rode `npx expo start` normalmente.

---

## Push Notifications

> **Requer dispositivo físico** — push notifications não funcionam em simuladores/emuladores.

1. Configure o `EAS_PROJECT_ID` no `.env.local`
2. Verifique que `extra.eas.projectId` está correto no `app.config.ts`
3. Use um development build instalado em um dispositivo físico
4. O token é registrado automaticamente após o sign-in

Para EAS credentials (certificados Apple Push / Firebase FCM):
```bash
npx eas credentials
```

---

## Diferença: `npm install` vs `npx expo install`

| Comando | Quando usar |
|---|---|
| `npm install <pacote>` | Pacotes JavaScript puros (ex: `axios`, `zustand`, `@tanstack/react-query`) |
| `npx expo install <pacote>` | Pacotes com código nativo (ex: `expo-notifications`, `expo-secure-store`) — garante versão compatível com o SDK |

---

## Scripts

```bash
npm start          # Inicia o dev server
npm run ios        # Dev server com foco em iOS
npm run android    # Dev server com foco em Android
npm run lint       # ESLint
npm run format     # Prettier
npm run typecheck  # TypeScript sem emitir arquivos
```

---

## Arquitetura

```
src/
├── app/                     # Expo Router — rotas file-based
│   ├── _layout.tsx          # Root layout: providers + Stack.Protected
│   ├── sign-in.tsx          # Rota pública
│   └── (app)/               # Grupo autenticado
│       ├── _layout.tsx      # Stack para telas não-tab (futuro: chat, detalhes)
│       └── (tabs)/          # Tabs: Home, Notificações, Perfil
├── components/ui/           # Primitivos de UI
├── components/shared/       # Componentes compostos reutilizáveis
├── constants/env.ts         # Typed env helper
├── features/notifications/  # Push notifications (register, listeners)
├── hooks/useSession.ts      # Hook principal de sessão
├── lib/api.ts               # Axios instance com interceptors
├── providers/SessionProvider.tsx  # Bootstrap, hydration, signIn, signOut
├── services/auth.service.ts       # Chamadas HTTP de auth
├── services/notifications.service.ts
├── store/auth.store.ts      # Zustand SSoT: user, tokens, isAuthenticated
├── theme/colors.ts
└── types/index.ts           # User (role: creator|company), ApiError
```

### Decisões principais

| Decisão | Escolha | Motivo |
|---|---|---|
| Auth guard | `Stack.Protected` | Padrão oficial Expo Router; redirect centralizado |
| Token para requests | In-memory (Zustand) | SecureStore só em hydration/persist/logout |
| Hydration | Tokens → `GET /me` | Usuário sempre sincronizado com backend |
| 401 handling | Interceptor limpa estado; Stack.Protected navega | Sem `router.replace` no Axios |
| Server state | TanStack Query | Separação limpa de transport e state |
| Bootstrap concorrência | Flag `useRef` no provider | Hydration roda exatamente uma vez |
| Cache reset no logout | `queryClient.clear()` | Evita vazamento de dados entre sessões |

---

## Extensão futura

- `src/features/creator/` — funcionalidades de creators
- `src/features/company/` — funcionalidades de empresas
- `User.role: 'creator' | 'company'` já preparado para roteamento condicional
- `src/app/(app)/` aceita novas rotas não-tab sem afetar as tabs existentes
