import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import type { NavigationProp } from "@react-navigation/native";
import { authApi } from "src/api/auth";
import type { RootStackParamList } from "src/app/navigation/types";
import { QK } from "src/utils/lib/queryKeys";

WebBrowser.maybeCompleteAuthSession();

type KakaoLoginBody = {
  success?: boolean;
  failure?: boolean;
  message?: string;
  email?: string;
  nickname?: string;
};

export function useKakaoLogin(navigation: NavigationProp<RootStackParamList>) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const clientId = process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID ?? "";
  const redirectUri = useMemo(
    () =>
      process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI ??
      AuthSession.makeRedirectUri({
        scheme: "tourmobile",
        path: "kakao",
      }),
    []
  );

  const run = async () => {
    if (!clientId) {
      throw new Error("EXPO_PUBLIC_KAKAO_CLIENT_ID 환경변수가 필요해요.");
    }

    try {
      setIsLoading(true);
      const request = await AuthSession.loadAsync(
        {
          clientId,
          responseType: AuthSession.ResponseType.Code,
          redirectUri,
        },
        {
          authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
        }
      );

      const result = await request.promptAsync(
        {
          authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
        },
        {
          url:
            `https://kauth.kakao.com/oauth/authorize?response_type=code` +
            `&client_id=${encodeURIComponent(clientId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}`,
        }
      );

      if (result.type !== "success") {
        if (result.type === "dismiss" || result.type === "cancel") return;
        throw new Error("카카오 로그인이 완료되지 않았어요.");
      }

      const code = result.params?.code;
      if (!code || Array.isArray(code)) {
        throw new Error("카카오 인증 코드를 받지 못했어요.");
      }

      const response = await authApi.kakaoLogin(code);
      const body = response.data as KakaoLoginBody;

      if (body.failure) {
        navigation.navigate("Register", {
          kakaoCode: code,
          kakaoEmail: body.email ?? "",
          kakaoNickname: body.nickname ?? "",
        });
        return;
      }

      if (body.success === false) {
        throw new Error(body.message || "카카오 로그인에 실패했어요.");
      }

      await queryClient.invalidateQueries({ queryKey: QK.sessionMe });
      await queryClient.refetchQueries({ queryKey: QK.sessionMe });
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    run,
    isLoading,
    redirectUri,
  };
}
