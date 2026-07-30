import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { registerForPushNotificationsAsync } from "src/features/notifications/usePushNotifications";
import { colors, layout, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";
import { ErrorToast } from "src/components/ui/ErrorToast";
import Notification from "src/assets/Alarm.svg";
import CameraIcon from "src/assets/Camera.svg";
import Gallery from "src/assets/Gallery.svg";
import Location2 from "src/assets/Location.svg";

type Props = NativeStackScreenProps<RootStackParamList, "Permission">;

const PERMISSIONS = [
  { title: "알림", description: "푸시알림 발송", Icon: Notification },
  { title: "카메라", description: "사진 업로드", Icon: CameraIcon },
  { title: "사진", description: "사진 업로드", Icon: Gallery },
  { title: "위치", description: "사용자 위치 기반", Icon: Location2 },
] as const;

export default function PermissionScreen({ navigation }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showError = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleAllow = async () => {
    try {
      setIsSubmitting(true);

      const notificationPermission = await Notifications.getPermissionsAsync();
      let notificationGranted =
        notificationPermission.granted ||
        notificationPermission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

      if (!notificationGranted) {
        const requested = await Notifications.requestPermissionsAsync();
        notificationGranted =
          requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
      }

      if (!notificationGranted) {
        showError("알림 권한을 허용해주세요.");
        return;
      }

      await registerForPushNotificationsAsync({ requestPermission: false });

      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      if (!cameraPermission.granted) {
        showError("카메라 권한을 허용해주세요.");
        return;
      }

      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!mediaPermission.granted) {
        showError("사진 권한을 허용해주세요.");
        return;
      }

      const locationPermission = await Location.requestForegroundPermissionsAsync();
      if (locationPermission.status !== "granted") {
        showError("위치 권한을 허용해주세요.");
        return;
      }

      navigation.replace("RegisterChoice");
    } catch {
      showError("권한 요청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="권한 안내" />
      <View style={styles.wrapper}>
        <Text style={styles.guide}>앱 사용 권한을 위해{"\n"}접근 권한을 허용해주세요.</Text>
        <View style={styles.listBox}>
          <Text style={styles.permissionSectionTitle}>선택 권한</Text>
          {PERMISSIONS.map((item) => {
            const Icon = item.Icon;
            return (
              <View key={item.title} style={styles.permissionRow}>
                <View style={styles.permissionLeft}>
                  <Icon width={32} height={32} />
                  <Text style={styles.permissionTitle}>{item.title}</Text>
                </View>
                <Text style={styles.permissionDescription}>{item.description}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={commonStyles.bottomAction}>
        <Pressable style={commonStyles.primaryButton} onPress={handleAllow} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color={colors.base[0]} />
          ) : (
            <Text style={commonStyles.primaryButtonText}>확인</Text>
          )}
        </Pressable>
      </View>

      <ErrorToast message={toastMessage} visible={toastVisible} onClose={() => setToastVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg[0] },
  wrapper: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 96,
    gap: 46,
  },
  guide: {
    ...typography.head2,
    color: colors.gray[800],
  },
  listBox: {
    gap: 20,
  },
  permissionSectionTitle: {
    ...typography.body1,
    color: colors.gray[600],
  },
  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
  },
  permissionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  permissionTitle: {
    ...typography.head4,
    color: colors.base[100],
  },
  permissionDescription: {
    ...typography.body4,
    color: colors.gray[600],
  },
});
