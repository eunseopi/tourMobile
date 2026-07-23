import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainScreen from "src/screens/MainScreen";
import ShopScreen from "src/screens/ShopScreen";
import ProductDetailScreen from "src/screens/ProductDetailScreen";
import MyPageScreen from "src/screens/MyPageScreen";
import CommunityScreen from "src/screens/CommunityScreen";
import PostDetailScreen from "src/screens/PostDetailScreen";
import ChallengeScreen from "src/screens/ChallengeScreen";
import ChallengeDetailScreen from "src/screens/ChallengeDetailScreen";
import ChallengeCompleteScreen from "src/screens/ChallengeCompleteScreen";
import MyCouponsScreen from "src/screens/MyCouponsScreen";
import CouponDetailScreen from "src/screens/CouponDetailScreen";
import ProfileEditScreen from "src/screens/ProfileEditScreen";
import ThemeEditScreen from "src/screens/ThemeEditScreen";
import PointConvertScreen from "src/screens/PointConvertScreen";
import PasswordResetScreen from "src/screens/PasswordResetScreen";
import LoginScreen from "src/screens/LoginScreen";
import RegisterScreen from "src/screens/RegisterScreen";
import SplashScreen from "src/screens/SplashScreen";
import PermissionScreen from "src/screens/PermissionScreen";
import LanguageSettingScreen from "src/screens/LanguageSettingScreen";
import RegisterChoiceScreen from "src/screens/RegisterChoiceScreen";
import MapScreen from "src/screens/MapScreen";
import SpotDetailScreen from "src/screens/SpotDetailScreen";
import PostWriteScreen from "src/screens/PostWriteScreen";
import { usePushNotificationBootstrap } from "src/features/notifications/usePushNotifications";
import type { ProductCategory } from "src/types/ProductTypes";
import type { ChallengeCardData } from "src/reducer/types";

export type RootStackParamList = {
  Splash: undefined;
  Permission: undefined;
  LanguageSetting: undefined;
  RegisterChoice: undefined;
  Main: undefined;
  Map:
    | {
        focusId?: string | number;
        latitude?: number;
        longitude?: number;
        type?: "POST" | "SPOT" | "CHALLENGE";
        filter?: "ALL" | "SPOT" | "POST" | "CHALLENGE";
      }
    | undefined;
  Login: undefined;
  Register:
    | {
        kakaoCode?: string;
        kakaoEmail?: string;
        kakaoNickname?: string;
      }
    | undefined;
  Shop: undefined;
  MyPage: undefined;
  MyCoupons: undefined;
  PointConvert: undefined;
  ProfileEdit: undefined;
  ThemeEdit: undefined;
  PasswordReset: undefined;
  CouponDetail: {
    exchangeId: string | number;
  };
  Community: undefined;
  Challenge:
    | {
        initialTab?: "pre" | "doing" | "done";
        highlightId?: string;
      }
    | undefined;
  ChallengeDetail: {
    challenge: ChallengeCardData;
  };
  ChallengeComplete: {
    challenge: ChallengeCardData;
  };
  PostDetail: {
    postId: number;
  };
  SpotDetail: {
    spotId: number;
  };
  PostWrite:
    | {
        initialLocation?: {
          name?: string;
          latitude: number;
          longitude: number;
          sourceType?: "POST" | "SPOT" | "CHALLENGE";
        };
        openedFromMap?: boolean;
      }
    | undefined;
  ProductDetail: {
    productId: string | number;
    category?: ProductCategory;
  };
};

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  usePushNotificationBootstrap();

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Permission"
            component={PermissionScreen}
            options={{ title: "권한 안내" }}
          />
          <Stack.Screen
            name="LanguageSetting"
            component={LanguageSettingScreen}
            options={{ title: "언어 설정" }}
          />
          <Stack.Screen
            name="RegisterChoice"
            component={RegisterChoiceScreen}
            options={{ title: "가입 방식 선택" }}
          />
          <Stack.Screen name="Main" component={MainScreen} options={{ title: "제주데이" }} />
          <Stack.Screen name="Map" component={MapScreen} options={{ title: "지도 탐색" }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: "로그인" }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "회원가입" }} />
          <Stack.Screen name="Shop" component={ShopScreen} options={{ title: "구매하기" }} />
          <Stack.Screen name="MyPage" component={MyPageScreen} options={{ title: "마이페이지" }} />
          <Stack.Screen name="MyCoupons" component={MyCouponsScreen} options={{ title: "내 쿠폰" }} />
          <Stack.Screen name="PointConvert" component={PointConvertScreen} options={{ title: "포인트 전환" }} />
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} options={{ title: "프로필 수정" }} />
          <Stack.Screen name="ThemeEdit" component={ThemeEditScreen} options={{ title: "관심 테마" }} />
          <Stack.Screen name="PasswordReset" component={PasswordResetScreen} options={{ title: "비밀번호 재설정" }} />
          <Stack.Screen name="CouponDetail" component={CouponDetailScreen} options={{ title: "쿠폰 상세" }} />
          <Stack.Screen name="Community" component={CommunityScreen} options={{ title: "커뮤니티" }} />
          <Stack.Screen name="Challenge" component={ChallengeScreen} options={{ title: "챌린지" }} />
          <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} options={{ title: "진행 전" }} />
          <Stack.Screen name="ChallengeComplete" component={ChallengeCompleteScreen} options={{ title: "챌린지 인증" }} />
          <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: "게시글" }} />
          <Stack.Screen name="SpotDetail" component={SpotDetailScreen} options={{ title: "스팟 상세" }} />
          <Stack.Screen name="PostWrite" component={PostWriteScreen} options={{ title: "스팟 추가" }} />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ title: "상품소개" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
