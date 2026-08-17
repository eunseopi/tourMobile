import type { NavigatorScreenParams } from "@react-navigation/native";
import type { ProductCategory } from "src/types/ProductTypes";
import type { ChallengeCardData } from "src/reducer/types";
import type { MissionTheme } from "src/api/missions";

export type MainTabParamList = {
  Home: undefined;
  Challenge:
    | {
        initialTab?: "pre" | "doing" | "done";
        highlightId?: string;
      }
    | undefined;
  Community: undefined;
  Shop: undefined;
  MyPage: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Permission: undefined;
  RegisterChoice: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Map:
    | {
        focusId?: string | number;
        latitude?: number;
        longitude?: number;
        filter?: "ALL" | "SPOT" | "CHALLENGE_ONGOING" | "CHALLENGE_DONE";
        pickMode?: boolean;
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
  MyCoupons: undefined;
  PointConvert: undefined;
  ProfileEdit: undefined;
  ThemeEdit: undefined;
  PasswordReset: undefined;
  About: undefined;
  Contact: undefined;
  Terms: undefined;
  PrivacyPolicy: undefined;
  BlockedUsers: undefined;
  MissionList: undefined;
  MissionDetail: {
    mission: MissionTheme;
  };
  Notification: undefined;
  MyActivity: undefined;
  CouponDetail: {
    exchangeId: string | number;
  };
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
  PostEdit: {
    postId: number;
  };
  CommunitySearch: { initialQuery?: string } | undefined;
  ProductDetail: {
    productId: string | number;
    category?: ProductCategory;
  };
};
