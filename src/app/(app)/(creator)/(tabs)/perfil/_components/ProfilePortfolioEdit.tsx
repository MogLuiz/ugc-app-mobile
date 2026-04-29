import { useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { Image } from 'expo-image'
import { useVideoPlayer, VideoView } from 'expo-video'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import theme from '@/theme/theme'
import type { CreatorPortfolioItem } from '@/modules/creator-profile/types'

const SECTION_PADDING = theme.spacing.s5
const GRID_GAP = 10

// ─── Video Player Modal ───────────────────────────────────────────────────────

function VideoPlayerModal({ uri, onClose }: { uri: string; onClose: () => void }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false
    void p.play()
  })

  return (
    <Modal
      visible
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={vp.container}>
        <VideoView
          player={player}
          style={vp.video}
          allowsFullscreen={false}
          nativeControls
          contentFit="contain"
        />
        <Pressable style={vp.closeButton} onPress={onClose} hitSlop={12}>
          <View style={vp.closeCircle}>
            <Ionicons name="close" size={20} color="#fff" />
          </View>
        </Pressable>
      </View>
    </Modal>
  )
}

const vp = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 24,
    right: 20,
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

// ─── Video Thumbnail ─────────────────────────────────────────────────────────
// Used when the backend doesn't provide a thumbnailUrl for a video.
// Creates a paused player showing the first frame of the video.

function VideoThumbnailView({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.pause()
  })

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
      allowsFullscreen={false}
    />
  )
}

// ─── Portfolio Item Card ──────────────────────────────────────────────────────

type PortfolioItemCardProps = {
  item: CreatorPortfolioItem
  width: number
  height: number
  isRemoving: boolean
  onRemove: (id: string) => void
  onPlayVideo: (uri: string) => void
}

function PortfolioItemCard({
  item,
  width,
  height,
  isRemoving,
  onRemove,
  onPlayVideo,
}: PortfolioItemCardProps) {
  const isVideo = item.mediaType === 'video'

  function handlePress() {
    if (isVideo && item.videoUrl) onPlayVideo(item.videoUrl)
  }

  return (
    <Pressable
      style={[styles.gridItem, { width, height }]}
      onPress={handlePress}
      disabled={!isVideo || !item.videoUrl}
    >
      {/* Thumbnail or placeholder */}
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={item.id}
          style={StyleSheet.absoluteFill}
        />
      ) : isVideo && item.videoUrl ? (
        // No thumbnailUrl from backend — render first frame via paused VideoView
        <VideoThumbnailView uri={item.videoUrl} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.imageFallback]} />
      )}

      {/* Video overlay: semi-dark scrim + play button */}
      {isVideo ? (
        <View style={styles.videoOverlay}>
          <View style={styles.playCircle}>
            <Ionicons name="play" size={16} color="#fff" style={styles.playIcon} />
          </View>
        </View>
      ) : null}

      {/* Video badge */}
      {isVideo ? (
        <View style={styles.videoBadge}>
          <Ionicons name="play" size={9} color="#fff" />
          <Text style={styles.videoBadgeText}>Vídeo</Text>
        </View>
      ) : null}

      {/* Remove / removing state */}
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
    </Pressable>
  )
}

// ─── Add Button ───────────────────────────────────────────────────────────────

function AddButton({
  width,
  height,
  isUploading,
  onPress,
}: {
  width: number
  height: number
  isUploading: boolean
  onPress: () => void
}) {
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

// ─── Section ──────────────────────────────────────────────────────────────────

type Props = {
  portfolio: CreatorPortfolioItem[]
  isUploading: boolean
  removingId: string | null
  onAdd: () => void
  onRemove: (id: string) => void
}

export function ProfilePortfolioEdit({
  portfolio,
  isUploading,
  removingId,
  onAdd,
  onRemove,
}: Props) {
  const { width: windowWidth } = useWindowDimensions()
  const [activeVideoUri, setActiveVideoUri] = useState<string | null>(null)

  const itemWidth = Math.floor(
    (windowWidth - SECTION_PADDING * 2 - GRID_GAP - theme.spacing.s5 * 2) / 2,
  )
  const itemHeight = Math.floor(itemWidth * (4 / 3))

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Portfólio</Text>
        {portfolio.length > 0 ? (
          <Text style={styles.count}>
            {portfolio.length} {portfolio.length === 1 ? 'mídia' : 'mídias'}
          </Text>
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
            onPlayVideo={setActiveVideoUri}
          />
        ))}
        <AddButton
          width={itemWidth}
          height={itemHeight}
          isUploading={isUploading}
          onPress={onAdd}
        />
      </View>

      {activeVideoUri ? (
        <VideoPlayerModal uri={activeVideoUri} onClose={() => setActiveVideoUri(null)} />
      ) : null}
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    marginLeft: 2, // optical center for play triangle
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
