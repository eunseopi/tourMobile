import { useState } from "react";
import { Image } from "expo-image";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import type { PostDetailProps } from "src/components/community/PostDetail/types";
import { ImageViewerModal } from "src/components/ui/ImageViewerModal";
import SpotMarker from "src/assets/spot.svg";
import { colors, typography } from "src/design/theme";
import { formatDate } from "src/utils/formDate";
import CommentIcon from "src/assets/CommentIcon.svg";
import DefaultProfile from "src/assets/default_profile.svg";
import HeartFilledIcon from "src/assets/HeartFilled.svg";
import HeartOutlineIcon from "src/assets/HeartOutline.svg";

type Props = {
  post: PostDetailProps;
  isLiking: boolean;
  onToggleLike: () => void;
  onTagPress?: (tag: string) => void;
};

export function PostDetailContent({ post, isLiking, onToggleLike, onTagPress }: Props) {
  const { width } = useWindowDimensions();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const images = post.imageUrls ?? [];

  return (
    <View>
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          {post.userProfile ? (
            <Image
              source={{ uri: post.userProfile }}
              style={styles.avatarImage}
              cachePolicy="memory-disk"
              transition={150}
            />
          ) : (
            <DefaultProfile width={32} height={32} />
          )}
        </View>
        <Text style={styles.author}>{post.userNickname || "익명"}</Text>
      </View>

      {images.length ? (
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(index);
            }}
          >
            {images.map((image, index) => (
              <Pressable
                key={`${image}-${index}`}
                onPress={() => {
                  setActiveImageIndex(index);
                  setViewerOpen(true);
                }}
              >
                <Image
                  source={{ uri: image }}
                  style={[styles.image, { width, height: width }]}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={150}
                />
              </Pressable>
            ))}
          </ScrollView>
          <ImageViewerModal
            visible={viewerOpen}
            images={images}
            initialIndex={activeImageIndex}
            onClose={() => setViewerOpen(false)}
          />
          {images.length > 1 ? (
            <View style={styles.dotsRow}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, index === activeImageIndex && styles.dotActive]}
                />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actionRow}>
        <Pressable onPress={onToggleLike} disabled={isLiking} hitSlop={6}>
          {post.likedByMe ? (
            <HeartFilledIcon width={26} height={26} />
          ) : (
            <HeartOutlineIcon width={26} height={26} />
          )}
        </Pressable>
        <CommentIcon width={25} height={25} />
      </View>

      <Text style={styles.likeCount}>좋아요 {post.likeCount ?? 0}개</Text>

      <View style={styles.captionBlock}>
        <Text style={styles.caption}>{post.title}</Text>
        <Text style={styles.description}>{post.description}</Text>

        <View style={styles.locationTag}>
          <Text style={styles.locationIcon}>⌖</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {post.name}
          </Text>
        </View>

        {post.tags?.length ? (
          <View style={styles.tagRow}>
            {post.tags.map((tag, index) => (
              <Pressable
                key={`${tag}-${index}`}
                style={styles.tagChip}
                onPress={() => onTagPress?.(tag)}
                hitSlop={4}
              >
                <Text style={styles.tagChipText}>#{tag}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {Number.isFinite(post.latitude) && Number.isFinite(post.longitude) ? (
          <View style={styles.miniMapWrap} pointerEvents="none">
            <MapView
              style={styles.miniMap}
              region={{
                latitude: Number(post.latitude),
                longitude: Number(post.longitude),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Marker coordinate={{ latitude: Number(post.latitude), longitude: Number(post.longitude) }}>
                <SpotMarker width={30} height={31} />
              </Marker>
            </MapView>
          </View>
        ) : null}

        <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.gray[100],
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  author: {
    ...typography.body3,
    color: colors.gray[800],
  },
  image: {
    backgroundColor: colors.gray[100],
  },
  dotsRow: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  dotActive: {
    backgroundColor: colors.base[0],
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  likeCount: {
    ...typography.body3,
    color: colors.gray[800],
    paddingHorizontal: 20,
    marginTop: 8,
  },
  captionBlock: {
    paddingHorizontal: 20,
    marginTop: 6,
    gap: 8,
  },
  caption: {
    ...typography.body3,
    color: colors.gray[800],
  },
  description: {
    ...typography.body4,
    color: colors.gray[700],
    lineHeight: 20,
  },
  locationTag: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "100%",
    paddingVertical: 6,
    paddingHorizontal: 7,
    borderRadius: 50,
    backgroundColor: colors.gray[100],
  },
  locationIcon: {
    ...typography.caption1,
    color: colors.gray[600],
  },
  locationText: {
    ...typography.caption1,
    color: colors.gray[600],
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 50,
    backgroundColor: colors.primary[50],
  },
  tagChipText: {
    ...typography.caption1,
    color: colors.primary[400],
  },
  miniMapWrap: {
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.gray[100],
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },
  date: {
    ...typography.caption2,
    color: colors.gray[600],
  },
});
