# Decision Heuristics

## 1. Heurística de Complexidade da Tela

**Avaliar antes do plano. Determina quantas fases a implementação terá.**

### SIMPLES
**Critérios:**
- Formulário com ≤ 4 campos
- Um único fluxo principal (sem branches condicionais significativos)
- ≤ 1 call de API
- Sem listas de dados
- Sem estado persistido além do form

**Abordagem:** Portar em uma etapa.

**Exemplos:** Login, recuperação de senha, confirmação de e-mail, tela de sucesso.

---

### MÉDIA
**Critérios:**
- Formulário com 5–8 campos, ou multi-step
- 2–3 calls de API
- Um estado condicional relevante (ex: confirmação_required vs sucesso)
- Lista curta (≤ 20 itens estáticos)
- Componentes secundários (tabs simples, seleção de opção)

**Abordagem:** Dividir em 2 fases:
- **Fase 1:** Estrutura + lógica (estados, validação, integração API)
- **Fase 2:** UI refinada (estilos, feedback visual, UX polish)

**Exemplos:** Cadastro com role selection, edição de perfil, criação de post simples.

---

### COMPLEXA
**Critérios:**
- Múltiplos fluxos condicionais (onboarding com branches por role)
- ≥ 4 calls de API ou upload de mídia
- Lista paginada ou infinita
- Tabs, modais, bottom sheets interativos
- Estado global envolvido (não apenas local)
- Componentes próprios necessários

**Abordagem:** Dividir em 3 fases:
- **Fase 1:** Estrutura de navegação + skeleton das telas
- **Fase 2:** Lógica de negócio + integração API + validação
- **Fase 3:** UI, UX polish, estados de edge case, componentes extraídos

**Exemplos:** Dashboard com múltiplas seções, tela de portfólio com upload, onboarding multi-step.

---

## 2. SCREEN vs MODAL vs BOTTOM SHEET

| Tipo | Quando usar | Exemplo |
|---|---|---|
| **SCREEN** | Fluxo principal, formulário completo, login/cadastro, onboarding, qualquer coisa com scroll longo | Login, cadastro, editar perfil, dashboard |
| **MODAL** | Confirmação simples, ação destrutiva, conteúdo curto sem scroll | "Confirmar exclusão?", "Sair da conta?" |
| **BOTTOM SHEET** | Seleção rápida, filtros, lista curta de opções, ações contextuais | Selecionar role, filtrar lista, opções de upload |

**Regra prática:**
- Tem formulário com campos? → SCREEN
- É uma pergunta sim/não ou ação única? → MODAL (Alert nativo pode ser suficiente)
- É seleção de item de lista ou ações rápidas? → BOTTOM SHEET

---

## 3. Quando Quebrar em Componente

**Criar componente separado se:**
- Repetição ≥ 2 vezes na mesma tela OU vai ser usado em outras telas
- Tem estado próprio independente do form
- Bloco visual com lógica isolada (ex: card de role, item de lista)

**Manter inline se:**
- Uso único e sem estado próprio
- Bloco simples sem ramificações de lógica
- Abstração não agrega legibilidade

**Onde criar:**
- Só nesta tela → subpasta `src/app/_components/` ou inline no arquivo
- Reutilizável em ≥ 2 telas → `src/components/`

---

## 4. Grid / Tabela Web → Mobile

| Web | Mobile |
|---|---|
| `<table>` com colunas | `<FlatList>` com cards verticais |
| Grid 2-3 colunas | `<FlatList numColumns={2}>` com cards |
| Linha com múltiplos dados | Card com dado principal destacado + secundários menores |
| Coluna de ações (edit/delete) | Swipe actions ou menu de contexto |

**Nunca recriar tabela no mobile.** Reorganizar para hierarquia visual mobile-first:
dado principal → grande/destacado, dados secundários → menores/abaixo.

---

## 5. Estados Obrigatórios

**Todo fluxo deve ter os 4 estados:**

| Estado | O que mostrar |
|---|---|
| **Loading** | `ActivityIndicator` ou skeleton, botão desabilitado |
| **Erro (campo)** | Mensagem inline abaixo do campo, borda vermelha |
| **Erro (global)** | Banner no topo do form ou mensagem centralizada |
| **Sucesso** | Navegação para próxima tela OU feedback conforme padrão do projeto |

**Empty state** (para listas):
- Lista vazia → mensagem + ação (ex: "Nenhum item. Criar primeiro?")
- Nunca deixar área em branco silenciosa

---

## 6. Formulários com Teclado

Sempre usar:
```tsx
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  <ScrollView keyboardShouldPersistTaps="handled">
    {/* campos */}
  </ScrollView>
</KeyboardAvoidingView>
```

Gerenciar foco entre campos com refs:
- `returnKeyType="next"` + `onSubmitEditing={() => nextRef.current?.focus()}`
- Último campo: `returnKeyType="done"` + `onSubmitEditing={handleSubmit}`

---

## 7. Componente Compartilhado Web — Regra de Avaliação

Antes de portar qualquer componente compartilhado do web (`AuthVisualPanel`, `FormField`, etc.):

1. O mobile precisa disso como abstração ou inline resolve? → se inline resolve, inline
2. Já existe em `src/components/`? → usar o existente
3. Será usado em ≥ 2 telas no mobile? → criar como componente mobile
4. É puramente cosmético (banner decorativo do desktop)? → não portar

**Lembrar:** componentes compartilhados do web frequentemente existem para lidar com layout desktop (split, sidebar, panels) — no mobile, esses não têm equivalente e não devem ser portados.
