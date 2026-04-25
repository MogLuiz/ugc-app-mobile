import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import theme from '@/theme/theme'
import type { CreatorPortfolioItem } from '@/modules/creator-profile/types'

const SECTION_PADDING = theme.spacing.s5
const GRID_GAP = 10

type PortfolioItemCardProps = {
  item: CreatorPortfolioItem
  width: number
  height: number
  isRemoving: boolean
  onRemove: (id: string) => void
}

function PortfolioItemCard({ item, width, height, isRemoving, onRemove }: PortfolioItemCardProps) {
  return (
    <View style={[styles.gridItem, { width, height }]}>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={item.id}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.imageFallback]} />
      )}

      {item.mediaType === 'video' ? (
        <View style={styles.videoBadge}>
          <Ionicons name="play" size={9} color="#fff" />
          <Text style={styles.videoBadgeText}>Vídeo</Text>
        </View>
      ) : null}

      {isRemoving ? (
        <View style={styles.removingOverlay}>
          <ActivityIndicator color="#fff" size="small" />
        </View>
      ) : (
        <Pressable
          style={styles.removeButton}
          onPress={() => onRemove(item.id)}
          hitSlop={8}
        >
          <Ionicons name="close" size={12} color="#fff" />
        </Pressable>
      )}
    </View>
  )
}

type AddButtonProps = {
  width: number
  height: number
  isUploading: boolean
  onPress: () => void
}

function AddButton({ width, height, isUploading, onPress }: AddButtonProps) {
  return (
    <Pressable
      style={[styles.gridItem, styles.addButton, { width, height }]}
      onPress={onPress}
      disabled={isUploading}
    >
      {isUploading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <>
          <View style={styles.addIcon}>
            <Ionicons name="add" size={22} color={colors.primary} />
          </View>
          <Text style={styles.addText}>Adicionar</Text>
        </>
      )}
    </Pressable>
  )
}

type Props = {
  portfolio: CreatorPortfolioItem[]
  isUploading: boolean
  removingId: string | null
  onAdd: () => void
  onRemove: (id: string) => void
}

export function ProfilePortfolioEdit({ portfolio, isUploading, removingId, onAdd, onRemove }: Props) {
  const { width: windowWidth } = useWindowDimensions()
  const itemWidth = Math.floor((windowWidth - SECTION_PADDING * 2 - GRID_GAP - theme.spacing.s5 * 2) / 2)
  const itemHeight = Math.floor(itemWidth * (4 / 3))

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Portfólio</Text>
        {portfolio.length > 0 ? (
          <Text style={styles.count}>{portfolio.length} {portfolio.length === 1 ? 'mídia' : 'mídias'}</Text>
        ) : null}
      </View>

      {portfolio.length === 0 && !isUploading ? (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={28} color={theme.colors.textMuted} />
          <Text style={styles.emptyTitle}>Nenhuma mídia ainda</Text>
          <Text style={styles.emptyBody}>
            Adicione fotos ao seu portfólio para aumentar suas chances de ser contratado.
          </Text>
        </View>
      ) : null}

      <View style={styles.grid}>
        {portfolio.map((item) => (
          <PortfolioItemCard
            key={item.id}
            item={item}
            width={itemWidth}
            height={itemHeight}
            isRemoving={removingId === item.id}
            onRemove={onRemove}
          />
        ))}
        <AddButton
          width={itemWidth}
          height={itemHeight}
          isUploading={isUploading}
          onPress={onAdd}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadii.card,
    padding: theme.spacing.s5,
    gap: theme.spacing.s4,
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textStrong,
    letterSpacing: 0.2,
  },
  count: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    gap: theme.spacing.s2,
    paddingVertical: theme.spacing.s3,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  emptyBody: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: theme.spacing.s4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  gridItem: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceAlt,
  },
  imageFallback: {
    backgroundColor: theme.colors.surfaceAlt,
  },
  videoBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  videoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: `${colors.primary}50`,
    backgroundColor: `${colors.primary}08`,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
})
