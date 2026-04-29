# Component Mapping: Web → React Native

## Elementos Base

| Web | React Native | Observações |
|---|---|---|
| `<div>` | `<View>` | Container padrão |
| `<span>`, `<p>`, `<h1-6>` | `<Text>` | Todo texto deve estar em Text |
| `<input>` | `<TextInput>` | Ver padrão de ref abaixo |
| `<textarea>` | `<TextInput multiline>` | |
| `<button>` | `<Pressable>` | NUNCA TouchableOpacity |
| `<a>` | `<Pressable onPress={() => router.push(...)}>` | |
| `<img>` | `<Image>` ou `<ExpoImage>` | Preferir expo-image |
| `<form>` | `<KeyboardAvoidingView>` + `<ScrollView>` | Ver estrutura abaixo |
| `<ul>/<li>` curtos | `<View>` + map | |
| `<ul>/<li>` longos / dados | `<FlatList>` | Nunca map em ScrollView para listas |
| Tabela / grid web | `<FlatList>` vertical com cards | NUNCA replicar tabela |
| Modal web | `<Modal>` nativo | Ou bottom sheet se seleção/ação |
| `<select>` / dropdown | Bottom sheet com lista de opções | |
| Toast / Snackbar | Ver seção de feedback abaixo | |
| Lucide icons | `@expo/vector-icons` (Ionicons) | |
| `<Checkbox>` | `<Pressable>` + ícone + estado local | |

---

## Estrutura de Formulário

**Web:**
```tsx
<form onSubmit={handleSubmit}>
  <input type="email" {...register('email')} />
  <button type="submit">Entrar</button>
</form>
```

**Mobile:**
```tsx
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={styles.container}
>
  <ScrollView keyboardShouldPersistTaps="handled">
    <TextInput
      ref={emailRef}
      value={email}
      onChangeText={setEmail}
      onSubmitEditing={() => passwordRef.current?.focus()}
      returnKeyType="next"
      keyboardType="email-address"
      autoCapitalize="none"
    />
    <Pressable onPress={handleSubmit}>
      <Text>Entrar</Text>
    </Pressable>
  </ScrollView>
</KeyboardAvoidingView>
```

**Padrão de refs entre campos:**
```tsx
const emailRef = useRef<TextInput>(null)
const passwordRef = useRef<TextInput>(null)
// onSubmitEditing do email → passwordRef.current?.focus()
// returnKeyType: 'next' (campos intermediários), 'done' (último campo)
```

---

## Feedback ao Usuário

Não mapear tudo para state local. Diferenciar:

### Erro de campo
→ Feedback **inline**, abaixo do campo.
```tsx
{errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
```

### Erro global (falha de submit, erro de API)
→ **Banner** ou bloco de erro no topo do formulário.
```tsx
{globalError && (
  <View style={styles.errorBanner}>
    <Text style={styles.errorBannerText}>{globalError}</Text>
  </View>
)}
```

### Sucesso transiente ("copiado!", "enviado!")
→ **Verificar padrão existente no projeto** antes de criar qualquer coisa:
1. Procurar uso de `Alert`, toast, ou snackbar nas telas existentes em `src/app/`
2. Se o projeto usa `Alert.alert()` → usar Alert
3. Se tem biblioteca de toast → usar ela
4. Se nada existe → usar `Alert.alert()` como padrão seguro

**Nunca inventar padrão novo de feedback sem verificar o que o projeto já usa.**

---

## Interações Web → Mobile

| Web | Mobile |
|---|---|
| `hover:` | `({ pressed }) => [style, pressed && styles.pressed]` |
| `cursor: pointer` | Não necessário — Pressable já indica toque |
| `focus:` visual | `onFocus` / `onBlur` no TextInput + estado local |
| `disabled` + opacity | `disabled` prop + `style={disabled && styles.disabled}` |
| `:active` scale | `transform: [{ scale: pressed ? 0.97 : 1 }]` (opcional) |

---

## Componentes Compartilhados Web

Antes de portar qualquer componente compartilhado do web, avaliar:

1. **Verificar se existe equivalente em `src/components/`** — não criar o que já existe
2. **Vai ser usado em ≥ 2 telas no mobile?** → criar em `src/components/`
3. **Uso único nesta tela?** → manter inline, sem abstração prematura
4. **É puramente visual e simples?** → inline sempre
5. **Tem estado próprio ou lógica reutilizável?** → componente separado

---

## Before/After Real: Login

**Web (`login.tsx`):**
```tsx
// React Router + React Hook Form + Tailwind
<form onSubmit={handleSubmit(onSubmit)}>
  <div className={`border ${errors.email ? 'border-red-400' : 'border-slate-200'}`}>
    <Mail className="text-slate-400" />
    <input {...register('email')} type="email" placeholder="E-mail" />
  </div>
  <button type="submit" disabled={isPending}>
    {isPending ? <Loader2 className="animate-spin" /> : 'Entrar'}
  </button>
</form>
```

**Mobile (`sign-in.tsx`):**
```tsx
// Expo Router + useState + StyleSheet
<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
  <ScrollView keyboardShouldPersistTaps="handled">
    <View style={[styles.inputRow, errors.email && styles.inputRowError]}>
      <Ionicons name="mail-outline" size={20} color={colors.text.secondary.light} />
      <TextInput
        ref={emailRef}
        style={styles.input}
        value={email}
        onChangeText={(v) => { setEmail(v); if (errors.email) setErrors(p => ({ ...p, email: undefined })) }}
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
    </View>
    {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}

    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, isSubmitting && styles.buttonDisabled]}
      onPress={handleSubmit}
      disabled={isSubmitting}
    >
      {isSubmitting
        ? <ActivityIndicator color="#fff" />
        : <Text style={styles.buttonText}>Entrar</Text>
      }
    </Pressable>
  </ScrollView>
</KeyboardAvoidingView>
```
