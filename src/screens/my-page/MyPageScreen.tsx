import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { authApi } from "src/api/auth";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { commonStyles } from "src/design/commonStyles";
import { colors, typography } from "src/design/theme";
import { useNotification } from "src/features/my-page/useNotification";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { authStorage } from "src/utils/lib/authStorage";
import { QK } from "src/utils/lib/queryKeys";
import { MyPageMenuList } from "./components/MyPageMenuList";
import { MyProfileSummary } from "./components/MyProfileSummary";

const gradeNameOf = (code?: string) => {
  switch (code) {
    case "BALBADAK":
      return "발바닥";
    default:
      return "발바닥";
  }
};

type Props = NativeStackScreenProps<RootStackParamList, "MyPage">;

export default function MyPageScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const { data: me, isLoading, isError, refetch } = useSessionMe();
  const { notiEnabled, toggleNoti } = useNotification();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const gradeName = useMemo(() => gradeNameOf(me?.moodGrade), [me?.moodGrade]);

  const handleLogout = () => {
    Alert.alert("로그아웃", "로그아웃 하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoggingOut(true);
            await authApi.logout();
          } catch {
            // 서버 로그아웃이 실패해도 로컬 세션은 정리한다
          } finally {
            await authStorage.clearLoginAt();
            queryClient.removeQueries({ queryKey: QK.sessionMe });
            setIsLoggingOut(false);
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="마이페이지" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary[400]} />
          <Text style={styles.mutedText}>내 정보를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (isError || !me) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="마이페이지" />
        <View style={styles.center}>
          <Text style={styles.errorText}>내 정보를 불러오지 못했어요.</Text>
          <Pressable style={commonStyles.primaryButton} onPress={() => refetch()}>
            <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="마이페이지" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <MyProfileSummary
        profile={me.profile}
        nickname={me.nickname}
        name={me.name}
        level={gradeName}
        onPressProfile={() => navigation.navigate("ProfileEdit")}
        onPressShop={() => navigation.navigate("Shop")}
        onPressCoupons={() => navigation.navigate("MyCoupons")}
      />

      <View style={styles.menuArea}>
        <MyPageMenuList
          notiEnabled={notiEnabled}
          onToggleNoti={toggleNoti}
          onPressCommunity={() => navigation.navigate("Community")}
          onPressChallenge={() => navigation.navigate("Challenge")}
          onPressProfile={() => navigation.navigate("ProfileEdit")}
          onPressTheme={() => navigation.navigate("ThemeEdit")}
          onPressPassword={() => navigation.navigate("PasswordReset")}
        />

        <Pressable style={styles.logoutButton} onPress={handleLogout} disabled={isLoggingOut}>
          <Text style={styles.logoutButtonText}>
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </Text>
        </Pressable>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg[0] },
  container: { flex: 1, backgroundColor: colors.bg[0] },
  content: { paddingBottom: 24 },
  menuArea: { padding: 20, backgroundColor: colors.bg[50] },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24, backgroundColor: colors.bg[0] },
  mutedText: { ...typography.body4, color: colors.gray[500] },
  errorText: { ...typography.body3, color: colors.error[100] },
  logoutButton: { marginTop: 20, alignItems: "center", justifyContent: "center", paddingVertical: 12 },
  logoutButtonText: { ...typography.body3, color: colors.gray[500] },
});
