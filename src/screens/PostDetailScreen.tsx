import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "../../App";
import { useQuery } from "@tanstack/react-query";
import { communityApi } from "src/api/community";
import { formatDate } from "src/utils/formDate";

type Props = NativeStackScreenProps<RootStackParamList, "PostDetail">;

export default function PostDetailScreen({ route }: Props) {
  const { postId } = route.params;
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["spotDetail", postId],
    queryFn: () => communityApi.getSpotDetail(postId).then((res) => res.data),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#ff8b4c" />
        <Text style={styles.mutedText}>게시글을 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>게시글을 찾을 수 없어요.</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  const firstImage = data.imageUrls?.[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{data.name}</Text>
      {firstImage ? <Image source={{ uri: firstImage }} style={styles.heroImage} /> : null}
      <Text style={styles.meta}>
        {data.userNickname || "익명"} · {formatDate(data.createdAt)}
      </Text>
      <Text style={styles.description}>{data.description}</Text>
      <Text style={styles.likeText}>좋아요 {data.likeCount ?? 0}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "900",
    color: "#191919",
  },
  heroImage: {
    width: "100%",
    aspectRatio: 1.2,
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: "#eee",
  },
  meta: {
    marginTop: 14,
    fontSize: 13,
    color: "#888",
  },
  description: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  likeText: {
    marginTop: 18,
    fontSize: 15,
    fontWeight: "800",
    color: "#ff8b4c",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  mutedText: {
    marginTop: 10,
    color: "#777",
  },
  errorText: {
    color: "#d33",
  },
  retryButton: {
    marginTop: 14,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
});
