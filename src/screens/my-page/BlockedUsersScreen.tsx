import { useQuery } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Alert } from "src/components/ui/AppAlert";
import type { RootStackParamList } from "src/app/navigation/types";
import type { BlockedUser } from "src/api/userBlock";
import { userBlockApi } from "src/api/userBlock";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { PressableScale } from "src/components/ui/PressableScale";
import { colors, typography } from "src/design/theme";
import { useBlockUser } from "src/features/community/useBlockUser";
import DefaultProfile from "src/assets/default_profile.svg";

type Props = NativeStackScreenProps<RootStackParamList, "BlockedUsers">;

export default function BlockedUsersScreen({}: Props) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["GET /api/users/blocked"],
    queryFn: () => userBlockApi.getBlocked().then((res) => res.data.data),
  });
  const { unblock } = useBlockUser();

  const handleUnblock = (user: BlockedUser) => {
    Alert.alert("차단 해제", `${user.nickname}님을 차단 해제할까요?`, [
      { text: "취소", style: "cancel" },
      {
        text: "해제하기",
        onPress: () => {
          unblock.mutate(user.userId, {
            onSuccess: () => void refetch(),
            onError: () => Alert.alert("실패", "잠시 후 다시 시도해주세요."),
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="차단 관리" />
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary[400]} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.mutedText}>목록을 불러오지 못했어요.</Text>
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => String(item.userId)}
          contentContainerStyle={styles.content}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.mutedText}>차단한 사용자가 없어요.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.profile}>
                {item.profile ? (
                  <Image
                    source={{ uri: item.profile }}
                    style={styles.profileImage}
                    cachePolicy="memory-disk"
                    transition={150}
                  />
                ) : (
                  <DefaultProfile width={40} height={40} />
                )}
              </View>
              <Text style={styles.nickname} numberOfLines={1}>
                {item.nickname}
              </Text>
              <PressableScale
                style={styles.unblockButton}
                onPress={() => handleUnblock(item)}
                disabled={unblock.isPending}
              >
                <Text style={styles.unblockButtonText}>차단 해제</Text>
              </PressableScale>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg[0] },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  mutedText: { ...typography.body4, color: colors.gray[600] },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  profile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[100],
  },
  profileImage: { width: "100%", height: "100%" },
  nickname: {
    flex: 1,
    ...typography.body3,
    color: colors.gray[800],
  },
  unblockButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.bg[0],
  },
  unblockButtonText: {
    ...typography.caption1,
    color: colors.gray[700],
  },
});
