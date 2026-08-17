import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Alert } from "src/components/ui/AppAlert";
import type { RootStackParamList } from "src/app/navigation/types";
import type { NotificationDto } from "src/api/notification";
import ClearIcon from "src/assets/Clear.svg";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { ScreenStateView } from "src/components/ui/ScreenStateView";
import { commonStyles } from "src/design/commonStyles";
import { colors, layout, shadow, typography } from "src/design/theme";
import { useNotificationList } from "src/features/notifications/useNotificationList";
import { resolveNotificationTarget } from "src/features/notifications/resolveNotificationTarget";

type Props = NativeStackScreenProps<RootStackParamList, "Notification">;

const NOTIFICATION_TYPE_LABEL: Record<NotificationDto["type"], string> = {
  REPLY: "댓글",
  CHALLENGE: "챌린지",
  STEP: "걸음수",
  COMMENTS: "대댓글",
  POPULARITY: "인기순",
  LIKE: "좋아요",
  ATTENDANCE: "미출석",
  MISSION: "미션",
};

// 서버가 formattedDate/formattedTime을 못 채워준 경우를 대비해 createdAt에서 직접 뽑아낸다.
function formatReceivedAt(item: NotificationDto) {
  if (item.formattedDate && item.formattedTime) {
    return `${item.formattedDate} · ${item.formattedTime}`;
  }
  const date = new Date(item.createdAt);
  if (Number.isNaN(date.getTime())) return item.formattedDate || item.formattedTime || "";
  return date.toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationScreen({ navigation }: Props) {
  const {
    notifications,
    isLoading,
    isError,
    refetch,
    markAsRead,
    markAllAsRead,
    deleteOne,
    deleteAll,
  } = useNotificationList();

  // react-query의 isRefetching은 백그라운드 폴링/읽음처리 후 자동 갱신 때도 true가 되어서,
  // 그걸 그대로 쓰면 알림을 하나 누를 때마다 pull-to-refresh처럼 목록이 튕기는 것처럼 보인다.
  // 사용자가 직접 당겨서 새로고침했을 때만 스피너가 보이도록 별도 상태로 분리한다.
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const hasUnread = notifications.some((item) => !item.read);

  const handleDeleteAll = () => {
    if (notifications.length === 0) return;
    Alert.alert("전체 삭제", "받은 알림을 모두 삭제할까요?", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => deleteAll() },
    ]);
  };

  if (isLoading) {
    return (
      <ScreenStateView
        type="loading"
        title="알림"
        loadingText="알림을 불러오는 중..."
        errorText="알림을 불러오지 못했어요."
      />
    );
  }

  if (isError) {
    return (
      <ScreenStateView
        type="error"
        title="알림"
        loadingText="알림을 불러오는 중..."
        errorText="알림을 불러오지 못했어요."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <View style={commonStyles.screen}>
      <ScreenHeader
        title="알림"
        right={
          <View style={styles.headerActions}>
            {hasUnread ? (
              <Pressable onPress={() => markAllAsRead()} hitSlop={8}>
                <Text style={styles.headerActionText}>모두 읽음</Text>
              </Pressable>
            ) : null}
            {notifications.length > 0 ? (
              <Pressable onPress={handleDeleteAll} hitSlop={8}>
                <Text style={styles.headerActionText}>전체 삭제</Text>
              </Pressable>
            ) : null}
          </View>
        }
      />
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        refreshing={isManualRefreshing}
        onRefresh={handleManualRefresh}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyContent : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>아직 받은 알림이 없어요.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <NotificationRow
            item={item}
            onPress={() => {
              if (!item.read) markAsRead(item.id);
              const target = resolveNotificationTarget(item.contextKey);
              if (target?.screen === "PostDetail") {
                navigation.navigate("PostDetail", { postId: target.postId });
              } else if (target?.screen === "SpotDetail") {
                navigation.navigate("SpotDetail", { spotId: target.spotId });
              } else if (target?.screen === "MissionList") {
                navigation.navigate("MissionList");
              }
            }}
            onDelete={() => deleteOne(item.id)}
          />
        )}
      />
    </View>
  );
}

function NotificationRow({
  item,
  onPress,
  onDelete,
}: {
  item: NotificationDto;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      {!item.read ? <View style={styles.unreadDot} /> : <View style={styles.unreadDotSpacer} />}
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{NOTIFICATION_TYPE_LABEL[item.type] ?? "알림"}</Text>
        <Text style={styles.rowText} numberOfLines={3}>
          {item.message}
        </Text>
        <Text style={styles.rowTime}>{formatReceivedAt(item)}</Text>
      </View>
      <Pressable accessibilityLabel="알림 삭제" hitSlop={8} onPress={onDelete} style={styles.deleteButton}>
        <ClearIcon width={18} height={18} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerActionText: {
    ...typography.caption1,
    color: colors.primary[400],
  },
  listContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 6,
    paddingBottom: 16,
    gap: 5,
  },
  emptyContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    ...typography.body4,
    color: colors.gray[600],
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
    ...shadow.card,
  },
  unreadDot: {
    marginTop: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[400],
  },
  unreadDotSpacer: {
    width: 8,
    height: 8,
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    ...typography.body3,
    color: colors.gray[800],
  },
  rowText: {
    ...typography.body4,
    color: colors.gray[600],
    lineHeight: 20,
  },
  rowTime: {
    ...typography.caption2,
    color: colors.gray[600],
    marginTop: 2,
  },
  deleteButton: {
    padding: 2,
  },
});
