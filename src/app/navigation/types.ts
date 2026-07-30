import type { NavigatorScreenParams } from "@react-navigation/native";
import type { ProductCategory } from "src/types/ProductTypes";
import type { ChallengeCardData } from "src/reducer/types";

export type MainTabParamList = {
  Home: undefined;
  Community: undefined;
  Challenge:
    | {
        initialTab?: "pre" | "doing" | "done";
        highlightId?: string;
      }
    | undefined;
  MyPage: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Permission: undefined;
  LanguageSetting: undefined;
  RegisterChoice: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
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
  MyCoupons: undefined;
  PointConvert: undefined;
  ProfileEdit: undefined;
  ThemeEdit: undefined;
  PasswordReset: undefined;
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
  ProductDetail: {
    productId: string | number;
    category?: ProductCategory;
  };
};
