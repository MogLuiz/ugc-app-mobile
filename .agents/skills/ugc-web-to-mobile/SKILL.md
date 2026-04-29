---
name: ugc-web-to-mobile
description: Specialist in porting web screens (React + Tailwind) to React Native/Expo, preserving 100% of business logic and API contracts while rebuilding UI for mobile-first UX. UGC project only.
license: MIT
metadata:
  author: Luiz Henrique
  version: 1.0.0
---

# UGC Web → Mobile

## Princípios Fundamentais

1. **Esta skill NÃO converte UI — ela reconstrói a tela no mobile usando a lógica do web.**
2. **Preserva lógica e intenção da tela web. NÃO busca equivalência visual 1:1 com desktop.** A prioridade é UX mobile-first e ergonomia do toque.
3. **Nunca duplica service, hook ou store.** Audita o que existe antes de criar qualquer coisa.
4. **Sempre usa os mesmos endpoints, payloads e contratos do web.** Nenhum endpoint inventado.
5. **Nunca quebra o fluxo de auth existente.**

---

## Workflow Obrigatório

### Etapa 1 — Análise Profunda do Web
Extrair da tela web:
- Estrutura e layout da tela
- Fluxo completo (estados: loading, erro, sucesso, empty, edge cases)
- Todos os estados locais
- Validações (regras, mensagens)
- Calls de API (endpoint, método, payload, response, tratamento de erro)
- Tipos TypeScript usados
- Hooks e services consumidos
- Navegação (para onde vai em cada caso)
- Componentes compartilhados utilizados

### Etapa 2 — Auditoria de Contratos de API
Para cada API usada, documentar:
- Endpoint exato
- Método HTTP
- Payload (campos, tipos)
- Response (shape exato)
- Tratamento de erros (códigos, mensagens)

→ O mobile usará EXATAMENTE o mesmo contrato. Não adaptar, não criar paralelo.

### Etapa 3 — Mapeamento para Mobile
Antes de criar qualquer arquivo, auditar:
- `src/services/` — existe service equivalente?
- `src/hooks/` — existe hook equivalente?
- `src/store/` — existe store equivalente?
- `src/components/` — existe componente equivalente?
- `src/app/` — qual é a rota correta para esta tela?

Não assumir nomes. Ler os arquivos e confirmar.

### Etapa 4 — Plano Antes de Codar (OBRIGATÓRIO)
**Nenhuma linha de código antes deste output:**

```
ANÁLISE DA TELA WEB
- Tela: [nome]
- Fluxo: [descrição]
- APIs: [lista com endpoint + payload + response]
- Estados: [loading, erro, sucesso, edge cases]
- Componentes web usados: [lista]

MAPEAMENTO MOBILE
- O que reutilizar: [service/hook/store com caminho]
- O que criar: [tela, componentes locais, helpers]
- Decisão de UX: [SCREEN / MODAL / BOTTOM SHEET + motivo]
- Complexidade: [SIMPLES / MÉDIA / COMPLEXA]
- Fases (se média/complexa): [fase 1, fase 2, ...]
- Rotas envolvidas: [caminhos reais do Expo Router]
```

### Etapa 5 — Implementação
- Screen com StyleSheet.create
- Integração com services/hooks existentes
- Validação com função síncrona local
- Navegação com Expo Router
- Todos os estados: loading, erro inline, erro global, sucesso

### Etapa 6 — Integração com Backend
- Mesmo endpoint do web
- Mesmo payload do web
- Mesmo tratamento de erro do web
- Usar error helpers existentes no projeto quando aplicável

### Etapa 7 — Verificação Final
Confirmar que:
- [ ] Compila sem erros TypeScript
- [ ] Navegação funciona (rotas reais)
- [ ] Submit funciona (payload correto)
- [ ] Estado de erro funciona (inline + global)
- [ ] Estado de loading funciona
- [ ] UX mobile adequada (touch targets, teclado, scroll)

---

## Regras Críticas

**ALWAYS:**
- Auditar o mobile antes de criar qualquer coisa
- Usar os mesmos contratos de API do web
- Usar StyleSheet.create com cores de `@/theme/colors`
- Usar Expo Router para navegação
- Ter todos os estados: loading / erro / sucesso / empty
- Verificar rotas reais em `src/app/` antes de navegar

**NEVER:**
- Criar service/hook/store duplicado
- Inventar endpoint ou alterar payload
- Usar react-hook-form ou zod no mobile
- Usar Tailwind ou classes CSS no mobile
- Usar TouchableOpacity (usar Pressable)
- Quebrar o fluxo de auth existente
- Assumir que um arquivo existe sem verificar

---

## Anti-patterns — Nunca Faça Isso

| Anti-pattern | Por quê é errado | O que fazer |
|---|---|---|
| Copiar JSX web literalmente | Primitivas incompatíveis, semântica diferente | Reconstruir com primitivas RN |
| Copiar classes Tailwind mecanicamente | Não existe no RN | StyleSheet.create com equivalentes |
| Recriar tabela/grid web | UX ruim no mobile, não escala | FlatList vertical com cards |
| Inventar endpoint ou payload | Quebra integração com backend | Usar exatamente o mesmo contrato do web |
| Ignorar loading/error/empty states | UX quebrada | Todo fluxo deve ter os 3 estados |
| Criar service duplicado | Duplicação de lógica, divergência futura | Auditar `/src/services/` primeiro |
| Portar componente compartilhado web automaticamente | Pode ser desnecessário no mobile | Avaliar: inline / local / compartilhado |
| Buscar equivalência visual 1:1 com desktop | Mobile tem ergonomia diferente | Priorizar UX mobile-first |

---

## Reference Guide

| Arquivo | Conteúdo |
|---|---|
| [component-mapping.md](references/component-mapping.md) | Web → RN: elementos, feedback ao usuário, componentes compartilhados |
| [styling-porting.md](references/styling-porting.md) | Tailwind → StyleSheet.create com exemplos do projeto |
| [navigation-porting.md](references/navigation-porting.md) | React Router → Expo Router com rotas reais do projeto |
| [logic-preservation.md](references/logic-preservation.md) | Auditoria de services/hooks/stores + padrão de form state |
| [decision-heuristics.md](references/decision-heuristics.md) | Screen vs Modal vs Bottom Sheet, complexidade, componentes |

---

## Output Format

Antes de codar, emitir sempre o bloco de análise da Etapa 4. O usuário deve poder aprovar antes da implementação.

Ao implementar, entregar:
1. Arquivo(s) de screen em `src/app/`
2. Componentes locais (se necessário) em subpasta da tela ou `src/components/`
3. Nenhum service/hook/store novo sem justificativa explícita de que não existe equivalente
