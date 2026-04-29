import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { useSession } from '@/hooks/useSession'
import { AppScreenHeader } from '@/components/AppScreenHeader'
import { colors } from '@/theme/colors'
import theme from '@/theme/theme'
import { useMyCreatorProfileEditQuery } from '@/modules/creator-profile/queries'
import {
  useUpdateProfileMutation,
  useUpdateCreatorProfileMutation,
  useUploadAvatarMutation,
  useUploadPortfolioMediaMutation,
  useDeletePortfolioMediaMutation,
} from '@/modules/creator-profile-edit/mutations'
import { validatePortfolioAsset } from '@/modules/creator-profile-edit/types'
import { useCreatorAvailabilityQuery, useReplaceAvailabilityMutation } from '@/modules/creator-calendar/queries'
import { mapAvailabilityDays } from '@/modules/creator-calendar/calendar-mappers'
import type { AvailabilityDay } from '@/modules/creator-calendar/types'
import { ProfileSkeleton } from './_components/ProfileSkeleton'
import { ProfileAvatarEditor } from './_components/ProfileAvatarEditor'
import { ProfileFormSection } from './_components/ProfileFormSection'
import { ProfileSocialsSection } from './_components/ProfileSocialsSection'
import { ProfilePortfolioEdit } from './_components/ProfilePortfolioEdit'
import { ProfileProgressBar } from './_components/ProfileProgressBar'
import { ProfileAddressSection } from './_components/ProfileAddressSection'
import { ProfileAvailabilitySection } from './_components/ProfileAvailabilitySection'

export default function PerfilScreen() {
  const { user } = useSession()
  const profileQuery = useMyCreatorProfileEditQuery(user?.id ?? '')
  const availabilityQuery = useCreatorAvailabilityQuery()

  // Profile fields
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [instagram, setInstagram] = useState('')
  const [tiktok, setTiktok] = useState('')

  // Availability state
  const [availabilityDays, setAvailabilityDays] = useState<AvailabilityDay[]>([])
  const [isAvailabilityDirty, setIsAvailabilityDirty] = useState(false)

  const updateProfileMutation = useUpdateProfileMutation()
  const updateCreatorMutation = useUpdateCreatorProfileMutation()
  const uploadAvatarMutation = useUploadAvatarMutation()
  const uploadPortfolioMutation = useUploadPortfolioMediaMutation()
  const deletePortfolioMutation = useDeletePortfolioMediaMutation()
  const replaceAvailabilityMutation = useReplaceAvailabilityMutation()

  const profile = profileQuery.data

  useEffect(() => {
    if (!profile) return
    setName(profile.name ?? '')
    setBio(profile.bio ?? '')
    setPhone(profile.phone ?? '')
    setStreet(profile.location.street ?? '')
    setNumber(profile.location.number ?? '')
    setCity(profile.location.city ?? '')
    setState(profile.location.state ?? '')
    setZipCode(profile.location.zipCode ?? '')
    setInstagram(profile.socials.instagramUsername ?? '')
    setTiktok(profile.socials.tiktokUsername ?? '')
  }, [profile])

  // Always initialize 7 days — whether data is loaded, undefined, or empty
  useEffect(() => {
    if (isAvailabilityDirty) return
    setAvailabilityDays(mapAvailabilityDays(availabilityQuery.data))
  }, [availabilityQuery.data, isAvailabilityDirty])

  const isProfileDirty = profile
    ? name !== (profile.name ?? '') ||
      bio !== (profile.bio ?? '') ||
      phone !== (profile.phone ?? '') ||
      street !== (profile.location.street ?? '') ||
      number !== (profile.location.number ?? '') ||
      city !== (profile.location.city ?? '') ||
      state !== (profile.location.state ?? '') ||
      zipCode !== (profile.location.zipCode ?? '')
    : false

  const isCreatorDirty = profile
    ? instagram !== (profile.socials.instagramUsername ?? '') ||
      tiktok !== (profile.socials.tiktokUsername ?? '')
    : false

  const isDirty = isProfileDirty || isCreatorDirty || isAvailabilityDirty
  const isSaving =
    updateProfileMutation.isPending ||
    updateCreatorMutation.isPending ||
    replaceAvailabilityMutation.isPending

  function updateAvailabilityDay(
    id: string,
    field: 'enabled' | 'start' | 'end',
    value: boolean | string,
  ) {
    setIsAvailabilityDirty(true)
    setAvailabilityDays((days) =>
      days.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
    )
  }

  function syncWeekdays() {
    const source = availabilityDays.find((d) => d.enabled)
    if (!source) return
    setIsAvailabilityDirty(true)
    setAvailabilityDays((days) =>
      days.map((d) => (d.enabled ? { ...d, start: source.start, end: source.end } : d)),
    )
  }

  async function handleSave() {
    if (!isDirty || isSaving) return

    // Validate availability only if the user changed it
    if (isAvailabilityDirty) {
      const invalidDay = availabilityDays.find((d) => {
        if (!d.enabled) return false
        if (!d.start || !d.end) return true
        return d.start >= d.end
      })
      if (invalidDay) {
        Alert.alert(
          'Horário inválido',
          'O horário inicial deve ser menor que o horário final.',
          [{ text: 'OK' }],
        )
        return
      }
    }

    const saves: Promise<unknown>[] = []

    if (isProfileDirty) {
      saves.push(
        updateProfileMutation.mutateAsync({
          name: name.trim() || undefined,
          bio: bio.trim() || undefined,
          phone: phone.trim() || undefined,
          addressStreet: street.trim() || undefined,
          addressNumber: number.trim() || undefined,
          addressCity: city.trim() || undefined,
          addressState: state.trim() || undefined,
          addressZipCode: zipCode.trim() || undefined,
        }),
      )
    }

    if (isCreatorDirty) {
      saves.push(
        updateCreatorMutation.mutateAsync({
          instagramUsername: instagram.trim() || undefined,
          tiktokUsername: tiktok.trim() || undefined,
        }),
      )
    }

    if (isAvailabilityDirty) {
      saves.push(
        replaceAvailabilityMutation.mutateAsync({
          days: availabilityDays.map((d) => ({
            dayOfWeek: d.dayOfWeek,
            isActive: d.enabled,
            startTime: d.enabled ? d.start : null,
            endTime: d.enabled ? d.end : null,
          })),
        }),
      )
    }

    try {
      await Promise.all(saves)
      if (isAvailabilityDirty) setIsAvailabilityDirty(false)
    } catch (error) {
      Alert.alert(
        'Erro ao salvar',
        error instanceof Error ? error.message : 'Não foi possível salvar as alterações.',
        [{ text: 'OK' }],
      )
    }
  }

  async function handlePickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    })

    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]
    try {
      await uploadAvatarMutation.mutateAsync({
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
        fileName: asset.fileName ?? 'avatar.jpg',
      })
    } catch (error) {
      Alert.alert(
        'Erro no upload',
        error instanceof Error ? error.message : 'Não foi possível atualizar a foto.',
        [{ text: 'OK' }],
      )
    }
  }

  async function handleAddPortfolioMedia() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    })

    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]
    const mimeType = asset.mimeType ?? 'image/jpeg'
    const validationError = validatePortfolioAsset(mimeType, asset.fileSize ?? undefined)

    if (validationError) {
      Alert.alert('Arquivo inválido', validationError, [{ text: 'OK' }])
      return
    }

    try {
      await uploadPortfolioMutation.mutateAsync({
        uri: asset.uri,
        mimeType,
        fileName: asset.fileName ?? 'media.jpg',
      })
    } catch (error) {
      Alert.alert(
        'Erro no upload',
        error instanceof Error ? error.message : 'Não foi possível adicionar a mídia.',
        [{ text: 'OK' }],
      )
    }
  }

  function handleRemovePortfolioMedia(mediaId: string) {
    Alert.alert(
      'Remover mídia',
      'Tem certeza que deseja remover esta mídia do portfólio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            deletePortfolioMutation.mutate(mediaId, {
              onError: (error) => {
                Alert.alert(
                  'Erro',
                  error instanceof Error ? error.message : 'Não foi possível remover a mídia.',
                  [{ text: 'OK' }],
                )
              },
            })
          },
        },
      ],
    )
  }

  if (profileQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerInline}>
          <AppScreenHeader title="Meu perfil" />
        </View>
        <ProfileSkeleton />
      </SafeAreaView>
    )
  }

  if (profileQuery.isError || !profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerInline}>
          <AppScreenHeader title="Meu perfil" />
        </View>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Não foi possível carregar seu perfil.</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => void profileQuery.refetch()}
          >
            <Text style={styles.retryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const removingId = deletePortfolioMutation.isPending
    ? (deletePortfolioMutation.variables ?? null)
    : null

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={profileQuery.isRefetching}
              onRefresh={() => void profileQuery.refetch()}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          <AppScreenHeader title="Meu perfil" />

          <ProfileProgressBar
            avatarUrl={profile.avatarUrl}
            name={name}
            bio={bio}
            phone={phone}
            city={city}
            instagram={instagram}
            tiktok={tiktok}
            portfolioLength={profile.portfolio.length}
          />

          <ProfileAvatarEditor
            avatarUrl={profile.avatarUrl}
            name={name}
            isUploading={uploadAvatarMutation.isPending}
            onPickImage={handlePickAvatar}
          />

          <ProfileFormSection
            name={name}
            onNameChange={setName}
            bio={bio}
            onBioChange={setBio}
            phone={phone}
            onPhoneChange={setPhone}
          />

          <ProfileAddressSection
            zipCode={zipCode}
            onZipCodeChange={setZipCode}
            street={street}
            onStreetChange={setStreet}
            number={number}
            onNumberChange={setNumber}
            city={city}
            onCityChange={setCity}
            state={state}
            onStateChange={setState}
          />

          <ProfilePortfolioEdit
            portfolio={profile.portfolio}
            isUploading={uploadPortfolioMutation.isPending}
            removingId={removingId}
            onAdd={handleAddPortfolioMedia}
            onRemove={handleRemovePortfolioMedia}
          />

          <ProfileAvailabilitySection
            days={availabilityDays}
            onUpdateDay={updateAvailabilityDay}
            isLoading={availabilityQuery.isLoading}
            isError={availabilityQuery.isError}
            onRetry={() => void availabilityQuery.refetch()}
          />

          <ProfileSocialsSection
            instagram={instagram}
            onInstagramChange={setInstagram}
            tiktok={tiktok}
            onTiktokChange={setTiktok}
          />

          <Pressable
            style={[styles.saveButton, (!isDirty || isSaving) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!isDirty || isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Salvando...' : 'Salvar alterações'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  headerInline: {
    paddingHorizontal: theme.spacing.s5,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.s5,
    paddingBottom: 40,
    gap: theme.spacing.s4,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.s8,
    gap: theme.spacing.s4,
  },
  errorText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: theme.spacing.s6,
    paddingVertical: theme.spacing.s3,
    borderRadius: theme.borderRadii.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadii.full,
    paddingVertical: theme.spacing.s4,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
    marginTop: theme.spacing.s2,
  },
  saveButtonDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
})
