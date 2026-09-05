import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { CompositeScreenProps } from "@react-navigation/native";
import { useScrollToTop } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Alert } from "src/components/ui/AppAlert";
import type {
  MainTabParamList,
  RootStackParamList,
} from "src/app/navigation/types";
import { authApi } from "src/api/auth";
import { userApi } from "src/api/users";
import { NotificationBellButton } from "src/components/navigation/NotificationBellButton";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { PressableScale } from "src/components/ui/PressableScale";
import { commonStyles } from "src/design/commonStyles";
import { colors, typography } from "src/design/theme";
import { useNotification } from "src/features/my-page/useNotification";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { authStorage } from "src/utils/lib/authStorage";
import { gradeNameOf } from "src/utils/lib/moodGrade";
import { onboardingStorage } from "src/utils/lib/onboardingStorage";
import { termsStorage } from "src/utils/lib/termsStorage";
import { useTabBarHeight } from "src/utils/lib/useTabBarHeight";
import { MyPageMenuList } from "./components/MyPageMenuList";
import { MyProfileSummary } from "./components/MyProfileSummary";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "MyPage">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function MyPageScreen({ navigation }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const tabBarHeight = useTabBarHeight();
  const queryClient = useQueryClient();
  const { data: me, isLoading, isError, refetch } = useSessionMe();
  const { notiEnabled, toggleNoti } = useNotification();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const gradeName = useMemo(() => gradeNameOf(me?.moodGrade), [me?.moodGrade]);

  const goToLogin = () => {
    const rootNavigation =
      navigation.getParent<NativeStackNavigationProp<RootStackParamList>>() ??
      navigation;
    rootNavigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const goToFirstScreen = () => {
    const rootNavigation =
      navigation.getParent<NativeStackNavigationProp<RootStackParamList>>() ??
      navigation;
    rootNavigation.reset({ index: 0, routes: [{ name: "Splash" }] });
  };

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
            // sessionMe만 지우면 다른 화면의 캐시(좋아요 상태, 활동 내역 등)가
            // 다음에 로그인하는 계정에게 그대로 노출될 수 있어 전체를 비운다.
            queryClient.clear();
            setIsLoggingOut(false);
            goToLogin();
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    if (!me) return;

    Alert.alert(
      "회원 탈퇴",
      "탈퇴 시 계정 정보와 활동 내역이 모두 삭제되며 복구할 수 없어요. 정말 탈퇴하시겠어요?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴하기",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeletingAccount(true);
              await userApi.deleteAccount(me.email);
              // 탈퇴 API는 계정만 비활성화하고 세션 쿠키는 유지하므로 별도로 로그아웃한다.
              try {
                await authApi.logout();
              } catch {
                // 계정 비활성화 직후 서버가 401을 반환해도 로컬 초기화는 계속한다.
              }
              await Promise.all([
                authStorage.clearLoginAt(),
                authStorage.clearRememberedEmail(),
                onboardingStorage.clearHasOnboarded(),
                termsStorage.clearHasAgreed(),
              ]);
              // 이전 사용자의 화면 데이터가 다음 가입자에게 잠깐이라도 노출되지 않게 모두 비운다.
              queryClient.clear();
              goToFirstScreen();
            } catch {
              Alert.alert(
                "탈퇴 실패",
                "회원 탈퇴 처리 중 문제가 발생했어요. 잠시 후 다시 시도해주세요."
              );
            } finally {
              setIsDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="마이페이지" showBack={false} />
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
        <ScreenHeader title="마이페이지" showBack={false} />
        <View style={styles.center}>
          <Text style={styles.errorText}>내 정보를 불러오지 못했어요.</Text>
          <PressableScale
            style={commonStyles.primaryButton}
            onPress={() => refetch()}
          >
            <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
          </PressableScale>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="마이페이지"
        showBack={false}
        right={<NotificationBellButton />}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.content}
        bounces={false}
      >
        <MyProfileSummary
          profile={me.profile}
          nickname={me.nickname}
          name={me.name}
          level={gradeName}
          hallabong={me.hallabong}
          totalSteps={me.totalSteps}
          onPressProfile={() => navigation.navigate("ProfileEdit")}
        />

        <View style={[styles.menuArea, { paddingBottom: tabBarHeight - 100 }]}>
          <MyPageMenuList
            notiEnabled={notiEnabled}
            onToggleNoti={toggleNoti}
            onPressActivity={() => navigation.navigate("MyActivity")}
            onPressBlockedUsers={() => navigation.navigate("BlockedUsers")}
            onPressTheme={() => navigation.navigate("ThemeEdit")}
            onPressPassword={() => navigation.navigate("PasswordReset")}
            onPressContact={() => navigation.navigate("Contact")}
            onPressAbout={() => navigation.navigate("About")}
            onPressTerms={() => navigation.navigate("Terms")}
            onPressPrivacy={() => navigation.navigate("PrivacyPolicy")}
          />

          <View style={styles.accountActions}>
            <PressableScale
              style={styles.logoutButton}
              scaleTo={0.96}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <Text style={styles.logoutButtonText}>
                {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
              </Text>
            </PressableScale>
            <Text style={styles.actionDivider}>|</Text>
            <PressableScale
              style={styles.logoutButton}
              scaleTo={0.96}
              onPress={handleDeleteAccount}
              disabled={isDeletingAccount}
            >
              <Text style={styles.deleteAccountButtonText}>
                {isDeletingAccount ? "탈퇴 처리 중..." : "회원탈퇴"}
              </Text>
            </PressableScale>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg[0] },
  container: { flex: 1, backgroundColor: colors.bg[0] },
  content: {},
  menuArea: { padding: 20, backgroundColor: colors.bg[50] },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.bg[0],
  },
  mutedText: { ...typography.body4, color: colors.gray[600] },
  errorText: { ...typography.body3, color: colors.error[100] },
  accountActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  logoutButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  logoutButtonText: { ...typography.body3, color: colors.gray[600] },
  actionDivider: { ...typography.body3, color: colors.gray[300] },
  deleteAccountButtonText: { ...typography.body3, color: colors.error[100] },
});
