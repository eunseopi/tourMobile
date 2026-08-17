import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "src/app/navigation/types";
import BellIcon from "src/assets/Alarm.svg";
import { colors } from "src/design/theme";
import { useNotification } from "src/features/my-page/useNotification";
import { useUnreadNotificationCount } from "src/features/notifications/useNotificationList";

// "알림설정" 토글은 푸시 발송 여부(예: 출석 리마인더)만 끄는 설정이고, 좋아요/댓글/미션
// 완료 같은 인앱 알림은 토글과 무관하게 계속 쌓인다. 그래서 토글이 꺼져 있어도 벨
// 아이콘 자체는 항상 보여줘야 이미 쌓인/새로 쌓이는 알림을 확인할 수 있다 — 대신
// 토글이 꺼졌다는 걸 알 수 있도록 아이콘을 흐리게(회색조에 가깝게) 보여준다.
export function NotificationBellButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { notiEnabled } = useNotification();
  const unreadCount = useUnreadNotificationCount();
  const hasUnread = unreadCount > 0;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!hasUnread) {
      scale.setValue(0);
      return;
    }
    scale.setValue(0);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 14 }).start();
  }, [hasUnread, unreadCount, scale]);

  return (
    <Pressable
      accessibilityLabel={notiEnabled ? "알림" : "알림 (꺼짐)"}
      hitSlop={12}
      style={styles.button}
      onPress={() => navigation.navigate("Notification")}
    >
      <View style={!notiEnabled && styles.iconDisabled}>
        <BellIcon width={22} height={22} />
      </View>
      {hasUnread ? <Animated.View style={[styles.badge, { transform: [{ scale }] }]} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 6,
  },
  iconDisabled: {
    opacity: 0.32,
  },
  badge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error[100],
    borderWidth: 1,
    borderColor: colors.bg[0],
  },
});
