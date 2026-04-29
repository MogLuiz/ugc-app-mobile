# Logic Preservation: Auditoria e Reutilização

## Princípio

Antes de criar qualquer service, hook ou store, auditar o que já existe no mobile. A lógica de negócio não muda — só a camada de apresentação muda.

---

## Auditoria Obrigatória (Etapa 3 do Workflow)

**Executar antes de criar qualquer arquivo:**

```bash
# Listar o que existe
ls src/services/
ls src/hooks/
ls src/store/
ls src/components/
```

Para cada arquivo encontrado:
1. Ler o arquivo
2. Identificar o que expõe (funções, tipos, estado)
3. Confirmar se cobre o caso de uso necessário
4. Só criar novo se não existir equivalente funcional

**Não assumir nomes.** O projeto pode ter renomeado, refatorado ou unificado arquivos. Verificar sempre.

---

## Padrões Atuais do Projeto

*(Verificar se ainda existem e com estes nomes antes de usar)*

### Service de Auth (`src/services/`)
- Expõe: `signIn(email, password)`, `signUp(email, password, meta)`, `getMe(token?)`, `signOut()`
- Return types discriminados: `SignInResult`, `SignUpResult` (`'success'` | `'confirmation_required'`)
- Helpers de erro: `getFriendlyAuthError(error)`, `getFriendlyRegisterError(error)`
- Integra: Supabase auth + API backend (`/profiles/me`, `/users/bootstrap`)

### Store de Auth (`src/store/`)
- Zustand store com: `user`, `accessToken`, `refreshToken`, `isAuthenticated`
- Métodos: `setAuth()`, `setTokens()`, `clearAuth()`
- Acessível fora de componentes via `.getState()`

### Hook de Sessão (`src/hooks/`)
- Combina store Zustand + SessionProvider
- Expõe: `{ user, accessToken, isAuthenticated, isLoading, signIn, signUp, signOut }`
- **Usar este hook nas telas — não acessar store diretamente**

### API Client (`src/lib/api.ts`)
- Axios com interceptors de token (request + 401 retry)
- Usar direto para calls ao backend — nunca criar novo cliente HTTP
- Handles token refresh automático

---

## Tipos Importantes

*(Verificar em `src/types/` antes de usar)*

```typescript
// Papéis de usuário
type UserRole = 'business' | 'creator'          // frontend
type BackendRole = 'COMPANY' | 'CREATOR'         // payload da API

// Usuário no frontend (transformado do backend)
type User = {
  id: string
  authUserId: string
  name: string
  email: string
  phone?: string
  role: UserRole
  avatarUrl?: string
  onboardingStep?: number
}

// Erro da API
type ApiError = {
  message: string
  code?: string
  statusCode: number
}
```

**Conversores disponíveis (verificar se existem):**
- `toFrontendRole(backendRole)` — `'COMPANY'` → `'business'`
- `toBackendRole(frontendRole)` — `'business'` → `'COMPANY'`
- `bootstrapToUser(payload)` — transforma `BootstrapPayload` em `User`

---

## Padrão de Form State (Mobile)

**Nunca usar react-hook-form ou zod no mobile.**

```typescript
// Estado local para formulários
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [errors, setErrors] = useState<Record<string, string | undefined>>({})
const [isSubmitting, setIsSubmitting] = useState(false)
const [globalError, setGlobalError] = useState<string | null>(null)

// Validação síncrona
function validate(): boolean {
  const newErrors: Record<string, string> = {}

  if (!email.trim()) {
    newErrors.email = 'E-mail é obrigatório'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    newErrors.email = 'E-mail inválido'
  }

  if (!password || password.length < 6) {
    newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

// Submit
async function handleSubmit() {
  if (!validate()) return
  setIsSubmitting(true)
  setGlobalError(null)
  try {
    await signIn(email.trim(), password)
    router.replace('/(app)/(tabs)')
  } catch (err) {
    setGlobalError(getFriendlyAuthError(err))
  } finally {
    setIsSubmitting(false)
  }
}

// Limpar erro ao editar campo
onChangeText={(v) => {
  setEmail(v)
  if (errors.email) setErrors(p => ({ ...p, email: undefined }))
}}
```

---

## Contratos de API

O mobile usa **exatamente** o mesmo contrato do web. Nunca adaptar payload, nunca renomear campos.

**Verificar no web antes de implementar:**
1. Qual endpoint? (`/profiles/me`, `/users/bootstrap`, etc.)
2. Qual método? (GET, POST, PATCH, DELETE)
3. Qual payload? (campos exatos, tipos, obrigatoriedade)
4. Qual response? (shape exato)
5. Quais erros? (status codes, mensagens esperadas)

**Exemplo — sign-up payload:**
```typescript
// Web envia:
await signUp(email, password, {
  name: name.trim(),
  role: role === 'business' ? 'COMPANY' : 'CREATOR'  // BackendRole
})

// Mobile deve enviar exatamente o mesmo shape
```

---

## Quando Criar Algo Novo

Só criar novo service/hook/store se:
1. A auditoria confirmou que não existe equivalente
2. A funcionalidade é específica desta tela e não será reutilizada → helper local, não service
3. A funcionalidade será usada em múltiplas telas → criar seguindo o padrão dos existentes

**Nunca criar service que replica o que `api.ts` já faz.**
**Nunca criar store que duplica o que o auth store já gerencia.**
