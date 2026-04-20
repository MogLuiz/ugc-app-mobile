# Styling: Tailwind → StyleSheet.create

## Regra Principal

Nunca copiar classes Tailwind mecanicamente. Traduzir a **intenção** visual para StyleSheet, usando o sistema de cores e tokens do projeto.

---

## Estrutura Padrão

```tsx
import { StyleSheet } from 'react-native'
import { colors } from '@/theme/colors'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  // ...
})
```

Definir o objeto `styles` no final do arquivo, após o componente.

---

## Tabela de Equivalências

### Layout

| Tailwind | StyleSheet |
|---|---|
| `flex` | `flex: 1` |
| `flex-row` | `flexDirection: 'row'` |
| `flex-col` | `flexDirection: 'column'` (padrão) |
| `items-center` | `alignItems: 'center'` |
| `justify-center` | `justifyContent: 'center'` |
| `justify-between` | `justifyContent: 'space-between'` |
| `gap-4` | `gap: 16` |
| `gap-2` | `gap: 8` |
| `flex-1` | `flex: 1` |
| `w-full` | `width: '100%'` |
| `h-12` | `height: 48` |

### Espaçamento (base: 4px = 1 unit)

| Tailwind | StyleSheet |
|---|---|
| `p-4` | `padding: 16` |
| `px-4` | `paddingHorizontal: 16` |
| `py-6` | `paddingVertical: 24` |
| `pt-8` | `paddingTop: 32` |
| `mb-4` | `marginBottom: 16` |
| `mt-2` | `marginTop: 8` |
| `mx-auto` | `alignSelf: 'center'` |

### Tipografia

| Tailwind | StyleSheet |
|---|---|
| `text-base` | `fontSize: 16` |
| `text-sm` | `fontSize: 14` |
| `text-lg` | `fontSize: 18` |
| `text-xl` | `fontSize: 20` |
| `text-2xl` | `fontSize: 24` |
| `font-medium` | `fontWeight: '500'` |
| `font-semibold` | `fontWeight: '600'` |
| `font-bold` | `fontWeight: '700'` |
| `text-center` | `textAlign: 'center'` |
| `leading-tight` | `lineHeight: fontSize * 1.25` |

### Bordas e Cantos

| Tailwind | StyleSheet |
|---|---|
| `rounded` | `borderRadius: 4` |
| `rounded-lg` | `borderRadius: 8` |
| `rounded-xl` | `borderRadius: 12` |
| `rounded-2xl` | `borderRadius: 16` |
| `rounded-full` | `borderRadius: 9999` |
| `border` | `borderWidth: 1` |
| `border-2` | `borderWidth: 2` |

### Sombra (RN 0.79+ usa CSS boxShadow)

| Tailwind | StyleSheet |
|---|---|
| `shadow-sm` | `boxShadow: '0 1px 2px rgba(0,0,0,0.05)'` |
| `shadow` | `boxShadow: '0 2px 4px rgba(0,0,0,0.1)'` |
| `shadow-md` | `boxShadow: '0 4px 6px rgba(0,0,0,0.1)'` |
| `shadow-lg` | `boxShadow: '0 8px 16px rgba(0,0,0,0.12)'` |

---

## Cores do Projeto

**Sempre importar de `@/theme/colors`, nunca hardcodar hex.**

```tsx
import { colors } from '@/theme/colors'

// Cores principais
colors.primary          // '#895af6' — marca/botões
colors.secondary        // '#7c4aed' — hover/pressed
colors.error            // '#EF4444' — erros
colors.success          // '#10B981' — sucesso
colors.warning          // '#F59E0B' — avisos

// Textos
colors.text.primary.light    // '#111827' — texto principal
colors.text.secondary.light  // '#6B7280' — placeholder/secundário

// Fundos
colors.background.light      // '#FFFFFF'
colors.surface.light         // '#F9FAFB' — cards/inputs

// Bordas
colors.border.light          // '#E5E7EB'
```

**Mapeamento Tailwind → colors:**

| Tailwind | Equivalente no projeto |
|---|---|
| `bg-[#895af6]` / `bg-purple-500` | `colors.primary` |
| `text-slate-900` / `text-gray-900` | `colors.text.primary.light` |
| `text-slate-500` / `text-gray-500` | `colors.text.secondary.light` |
| `border-slate-200` / `border-gray-200` | `colors.border.light` |
| `bg-gray-50` / `bg-slate-50` | `colors.surface.light` |
| `border-red-400` / `text-red-500` | `colors.error` |
| `text-green-500` | `colors.success` |

---

## Estilos Condicionais

**Web (Tailwind):**
```tsx
className={`border ${errors.email ? 'border-red-400' : 'border-slate-200'}`}
```

**Mobile (StyleSheet):**
```tsx
style={[styles.inputRow, errors.email && styles.inputRowError]}
```

```tsx
const styles = StyleSheet.create({
  inputRow: {
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  inputRowError: {
    borderColor: colors.error,
  },
})
```

---

## Hover → Pressed State

**Web:**
```tsx
className="hover:bg-purple-700"
```

**Mobile:**
```tsx
<Pressable
  style={({ pressed }) => [
    styles.button,
    pressed && styles.buttonPressed,
  ]}
>
```

```tsx
const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
  },
  buttonPressed: {
    backgroundColor: colors.secondary,
    // ou: opacity: 0.85
  },
})
```

---

## Responsive (lg: / md:)

Classes responsivas web para desktop geralmente **não se aplicam no mobile**. Ignorar `lg:`, `md:`, `xl:` prefixes.

Quando há genuína diferença iOS/Android, usar:
```tsx
import { Platform } from 'react-native'

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
  },
})
// ou
Platform.select({ ios: value, android: value })
```

---

## Padrão Completo de Arquivo

Baseado no `sign-up.tsx` existente no projeto:

```tsx
// 1. Imports
import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native'
import { colors } from '@/theme/colors'

// 2. Componente
export default function MyScreen() {
  return (
    <View style={styles.container}>
      {/* ... */}
    </View>
  )
}

// 3. Styles no final do arquivo
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  // campos de input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface.light,
  },
  inputRowError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary.light,
  },
  fieldError: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  // botão primário
  button: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.secondary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
```
