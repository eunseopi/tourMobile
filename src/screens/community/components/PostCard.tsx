import { memo, useRef } from "react";
import { Image } from "expo-image";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, typography } from "src/design/theme";
import type { Spot } from "src/reducer/types";
import { formatDate } from "src/utils/formDate";
import CommentIcon from "src/assets/CommentIcon.svg";
import DefaultProfile from "src/assets/default_profile.svg";
import HeartFilledIcon from "src/assets/HeartFilled.svg";
import HeartOutlineIcon from "src/assets/HeartOutline.svg";

type Props = {
  post: Spot;
  onPress: (post: Spot) => void;
  onToggleLike: (post: Spot) => void;
};

const TYPE_CHIP: Record<Spot["type"], { label: string; color: string; bg: string }> = {
  POST: { label: "포스트", color: colors.gray[600], bg: colors.gray[100] },
  SPOT: { label: "스팟", color: colors.primary[500], bg: colors.primary[50] },
  CHALLENGE: { label: "챌린지", color: "#2563EB", bg: "#EAF1FF" },
};

function TypeChip({ type }: { type: Spot["type"] }) {
  const chip = TYPE_CHIP[type];
  if (!chip) return null;
  return (
    <View style={[styles.typeChip, { backgroundColor: chip.bg }]}>
      <Text style={[styles.typeChipText, { color: chip.color }]}>{chip.label}</Text>
    </View>
  );
}

// 좋아요 탭 한 번에 피드 전체가 다시 렌더링되는 걸 막기 위해, post 참조와 콜백이
// 그대로면(같은 함수 참조 + 변경되지 않은 post) 리렌더를 건너뛴다. onPress/onToggleLike는
// 호출부(CommunityScreen)에서 useCallback으로 고정된 최상위 함수를 그대로 넘겨야 효과가 있다.
export const PostCard = memo(function PostCard({ post, onPress, onToggleLike }: Props) {
  const commentCount = post.commentCount ?? 0;
  const coverImage = post.imageUrls?.[0];
  const extraImageCount = (post.imageUrls?.length ?? 0) - 1;
  const cardScale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  const animateCardTo = (value: number) => {
    Animated.spring(cardScale, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };

  const handleToggleLike = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    heartScale.setValue(0.7);
    Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 16 }).start();
    onToggleLike(post);
  };

  return (
    <Animated.View style={{ transform: [{ scale: cardScale }] }}>
      <Pressable
        style={styles.postCard}
        onPress={() => onPress(post)}
        onPressIn={() => animateCardTo(0.98)}
        onPressOut={() => animateCardTo(1)}
      >
      <View style={styles.postHeader}>
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
        <Text style={styles.author} numberOfLines={1}>
          {post.userNickname || "익명"}
        </Text>
        <TypeChip type={post.type} />
      </View>

      {coverImage ? (
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: coverImage }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
          />
          {extraImageCount > 0 ? (
            <View style={styles.imageCountBadge}>
              <Text style={styles.imageCountText}>1/{extraImageCount + 1}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actionRow}>
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            handleToggleLike();
          }}
          hitSlop={6}
        >
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            {post.likedByMe ? (
              <HeartFilledIcon width={24} height={24} />
            ) : (
              <HeartOutlineIcon width={24} height={24} />
            )}
          </Animated.View>
        </Pressable>
        <CommentIcon width={23} height={23} />
      </View>

      <Text style={styles.likeCount}>좋아요 {post.likeCount || 0}개</Text>

      {post.type === "POST" && typeof post.likesUntilPromotion === "number" ? (
        <Text style={styles.promotionText}>
          {post.likesUntilPromotion > 0
            ? `스팟 승격까지 좋아요 ${post.likesUntilPromotion}개`
            : "곧 스팟으로 승격돼요!"}
        </Text>
      ) : null}

      {post.type === "SPOT" ? (
        <Text style={styles.promotionText}>
          인기 스팟 중 상위권은 매시간 챌린지로 승격될 수 있어요
        </Text>
      ) : null}

      <View style={styles.captionBlock}>
        <Text style={styles.caption} numberOfLines={2}>
          {post.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {post.description}
        </Text>
        {commentCount > 0 ? (
          <Text style={styles.viewCommentsText}>댓글 {commentCount}개 모두 보기</Text>
        ) : null}
        <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
      </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: colors.bg[0],
    borderBottomWidth: 8,
    borderBottomColor: colors.bg[50],
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    flexShrink: 1,
  },
  typeChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  typeChipText: {
    ...typography.caption2,
    fontSize: 11,
    fontWeight: "700",
  },
  imageWrapper: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.gray[100],
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageCountBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  imageCountText: {
    ...typography.caption2,
    fontSize: 11,
    color: colors.base[0],
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  likeCount: {
    ...typography.body3,
    color: colors.gray[800],
    paddingHorizontal: 16,
    marginTop: 6,
  },
  promotionText: {
    ...typography.caption1,
    fontWeight: "600",
    color: colors.primary[400],
    paddingHorizontal: 16,
    marginTop: 2,
  },
  captionBlock: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 4,
  },
  caption: {
    ...typography.body3,
    color: colors.gray[800],
  },
  description: {
    ...typography.body4,
    color: colors.gray[600],
  },
  viewCommentsText: {
    ...typography.caption1,
    color: colors.gray[600],
  },
  date: {
    ...typography.caption2,
    color: colors.gray[600],
    marginTop: 2,
  },
});
