import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { communityApi } from "src/api/community";
import { formatDate } from "src/utils/formDate";
import { commonStyles } from "src/design/commonStyles";
import { colors, typography } from "src/design/theme";

type Props = NativeStackScreenProps<RootStackParamList, "SpotDetail">;

export default function SpotDetailScreen({ route, navigation }: Props) {
  const { spotId } = route.params;
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["spotDetail", spotId],
    queryFn: () => communityApi.getSpotDetail(spotId).then((res) => res.data),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary[400]} />
        <Text style={styles.mutedText}>스팟 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>스팟 정보를 찾을 수 없어요.</Text>
        <Pressable style={commonStyles.primaryButton} onPress={() => refetch()}>
          <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
      }
    >
      <Text style={styles.title}>{data.name}</Text>
      {data.imageUrls?.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sliderWrapper}
        >
          {data.imageUrls.map((image, index) => (
            <Image key={`${image}-${index}`} source={{ uri: image }} style={styles.slideImage} />
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.slideImage, styles.heroFallback]}>
          <Text style={styles.heroFallbackText}>SPOT</Text>
        </View>
      )}

      <View style={styles.postWrapper}>
        <Text style={styles.meta}>
          {data.userNickname || "제주데이"} · {formatDate(data.createdAt)}
        </Text>
        <View style={styles.locationTag}>
          <Text style={styles.locationIcon}>⌖</Text>
          <Text style={styles.locationText} numberOfLines={1}>{data.name}</Text>
        </View>
        <Text style={styles.description}>
          {data.description || "이 스팟에 대한 소개가 아직 준비되지 않았어요."}
        </Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>좋아요 {data.likeCount ?? 0}</Text>
          <Text style={styles.statText}>
            {Number(data.latitude).toFixed(3)}, {Number(data.longitude).toFixed(3)}
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            navigation.navigate("Map", {
              focusId: String(data.id),
              latitude: data.latitude,
              longitude: data.longitude,
              type: "SPOT",
            })
          }
        >
          <Text style={styles.primaryButtonText}>지도에서 보기</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Community")}
        >
          <Text style={styles.secondaryButtonText}>커뮤니티로</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[0],
  },
  content: {
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.bg[0],
  },
  mutedText: {
    ...typography.body4,
    color: colors.gray[500],
  },
  errorText: {
    ...typography.body3,
    color: colors.error[100],
  },
  title: {
    ...typography.head2,
    color: colors.gray[800],
    paddingLeft: 20,
    paddingTop: 10,
  },
  sliderWrapper: {
    gap: 10,
    paddingVertical: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  slideImage: {
    width: 260,
    height: 260,
    borderRadius: 8,
    backgroundColor: colors.gray[300],
  },
  heroFallback: {
    marginTop: 20,
    marginLeft: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[50],
  },
  heroFallbackText: {
    ...typography.head2,
    color: colors.primary[400],
  },
  postWrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 22,
  },
  meta: {
    ...typography.caption2,
    color: colors.gray[400],
  },
  locationTag: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "100%",
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 7,
    borderRadius: 50,
    backgroundColor: colors.gray[100],
  },
  locationIcon: {
    ...typography.caption1,
    color: colors.gray[400],
  },
  locationText: {
    ...typography.caption1,
    color: colors.gray[500],
  },
  description: {
    ...typography.body4,
    color: colors.gray[700],
    paddingVertical: 10,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statText: {
    ...typography.caption1,
    color: colors.gray[500],
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 100,
    backgroundColor: colors.gray[100],
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  primaryButton: {
    ...commonStyles.primaryButton,
    flex: 1,
  },
  primaryButtonText: {
    ...commonStyles.primaryButtonText,
  },
  secondaryButton: {
    ...commonStyles.secondaryButton,
    flex: 1,
  },
  secondaryButtonText: {
    ...commonStyles.secondaryButtonText,
  },
});
