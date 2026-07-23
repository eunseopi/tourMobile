import { useMemo, useReducer, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { AxiosError } from "axios";
import type { RootStackParamList } from "../../App";
import { colors, layout, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";
import { authApi } from "src/api/auth";
import { QK } from "src/utils/lib/queryKeys";
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
} from "src/utils/validation/authValidation";
import type { RegisterAction, RegisterState } from "src/types/RegisterTypes";
import type { UploadableImage } from "src/types/SpotTypes";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

type GenderValue = "male" | "female" | "";

type ApiBody<T = unknown> = {
  success?: boolean;
  failure?: boolean;
  message?: string;
  data?: T;
};

const THEME_OPTIONS = [
  "데이트",
  "힐링",
  "반려동물",
  "사진 명소",
  "가족 여행",
  "자연",
  "한달 살이",
  "나홀로 여행",
  "맛집 탐방",
] as const;

const initialRegisterState: RegisterState = {
  email: "",
  isEmailValid: false,
  isDuplicateChecked: false,
  showAuthInput: false,
  authCode: "",
  authPassed: false,
  emailError: "",
  authError: "",
  gender: "",
  birthYear: "",
  birthYearError: "",
  password: "",
  nickname: "",
  imageUrl: "",
  nicknameError: "",
  isNicknameDuplicatedChecked: false,
  isCheckingNickname: false,
  isRegisterMode: true,
  referralCode: "제주데이",
  referralError: "",
  themes: [],
  kakaoCode: undefined,
  kakaoEmail: undefined,
  kakaoNickname: undefined,
};

function registerReducer(state: RegisterState, action: RegisterAction): RegisterState {
  switch (action.type) {
    case "SET_EMAIL":
      return {
        ...state,
        email: action.value,
        isEmailValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(action.value),
        isDuplicateChecked: false,
        showAuthInput: false,
        authPassed: false,
        emailError: "",
        authError: "",
      };
    case "VALIDATE_EMAIL":
      return {
        ...state,
        isEmailValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email),
        emailError: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)
          ? ""
          : "유효한 이메일 형식이 아닙니다.",
      };
    case "CHECK_DUPLICATE_SUCCESS":
      return { ...state, isDuplicateChecked: true };
    case "SHOW_AUTH_INPUT":
      return { ...state, showAuthInput: true };
    case "SET_AUTH_CODE":
      return { ...state, authCode: action.value };
    case "AUTH_SUCCESS":
      return { ...state, authPassed: true, authError: "" };
    case "SET_EMAIL_ERROR":
      return { ...state, emailError: action.message };
    case "SET_AUTH_ERROR":
      return { ...state, authError: action.message };
    case "SET_GENDER":
      return { ...state, gender: action.value as GenderValue };
    case "SET_BIRTH_YEAR":
      return { ...state, birthYear: action.value };
    case "SET_BIRTH_YEAR_ERROR":
      return { ...state, birthYearError: action.message };
    case "SET_PASSWORD":
      return { ...state, password: action.value };
    case "SET_NICKNAME":
      return { ...state, nickname: action.value };
    case "SET_IMAGE_URL":
      return { ...state, imageUrl: action.payload };
    case "SET_NICKNAME_ERROR":
      return { ...state, nicknameError: action.payload };
    case "SET_CHECKING_NICKNAME":
      return { ...state, isCheckingNickname: action.payload };
    case "SET_NICKNAME_DUPLICATE_CHECKED":
      return { ...state, isNicknameDuplicatedChecked: action.payload };
    case "SET_REFERRAL_CODE":
      return { ...state, referralCode: action.payload };
    case "SET_REFERRAL_ERROR":
      return { ...state, referralError: action.payload };
    case "SET_THEMES":
      return { ...state, themes: action.payload };
    case "RESET":
      return initialRegisterState;
    default:
      return state;
  }
}

export default function RegisterScreen({ navigation, route }: Props) {
  const routeParams = route.params;
  const isKakaoRegister = !!routeParams?.kakaoCode || !!routeParams?.kakaoEmail || !!routeParams?.kakaoNickname;
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(registerReducer, {
    ...initialRegisterState,
    kakaoCode: routeParams?.kakaoCode,
    kakaoEmail: routeParams?.kakaoEmail,
    kakaoNickname: routeParams?.kakaoNickname,
    email: routeParams?.kakaoEmail ?? "",
    authPassed: routeParams?.kakaoEmail ? true : false,
    isEmailValid: routeParams?.kakaoEmail ? true : false,
  });
  const [step, setStep] = useState(0);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<UploadableImage | null>(null);

  const stepTitle = useMemo(() => {
    switch (step) {
      case 0:
        return isKakaoRegister ? "기본 정보" : "이메일 인증";
      case 1:
        return isKakaoRegister ? "프로필" : "기본 정보";
      case 2:
        return isKakaoRegister ? "관심 테마" : "비밀번호";
      case 3:
        return "프로필";
      case 4:
        return "관심 테마";
      default:
        return "회원가입";
    }
  }, [step]);

  const totalSteps = isKakaoRegister ? 3 : 5;

  const getErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message || (error instanceof Error ? error.message : fallback);
  };

  const handleSendCode = async () => {
    const emailMessage = validateEmail(state.email);
    if (emailMessage) {
      dispatch({ type: "SET_EMAIL_ERROR", message: emailMessage });
      return;
    }

    try {
      setIsSendingCode(true);
      const duplicateResponse = await authApi.checkEmailDuplicate(state.email.trim());
      const duplicateBody = duplicateResponse.data as ApiBody<boolean>;

      if (duplicateBody.data) {
        dispatch({ type: "SET_EMAIL_ERROR", message: "이미 사용중인 이메일입니다." });
        return;
      }

      dispatch({ type: "CHECK_DUPLICATE_SUCCESS" });
      dispatch({ type: "SHOW_AUTH_INPUT" });
      dispatch({ type: "SET_EMAIL_ERROR", message: "" });

      await authApi.sendEmailCode(state.email.trim());
      Alert.alert("인증번호 발송", "이메일로 인증번호를 보냈어요.");
    } catch (error) {
      dispatch({
        type: "SET_EMAIL_ERROR",
        message: getErrorMessage(error, "인증번호 발송 중 오류가 발생했습니다."),
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!state.authCode.trim()) {
      dispatch({ type: "SET_AUTH_ERROR", message: "인증번호를 입력해주세요." });
      return;
    }

    try {
      setIsVerifyingCode(true);
      const response = await authApi.verifyEmailCode(state.email.trim(), state.authCode.trim());
      const body = response.data as ApiBody;

      if (body.success) {
        dispatch({ type: "AUTH_SUCCESS" });
        Alert.alert("인증 완료", "이메일 인증이 완료됐어요.");
        return;
      }

      dispatch({
        type: "SET_AUTH_ERROR",
        message: body.message || "인증번호가 올바르지 않습니다.",
      });
    } catch (error) {
      dispatch({
        type: "SET_AUTH_ERROR",
        message: getErrorMessage(error, "서버와 통신 중 오류가 발생했습니다."),
      });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const validateBirthYear = () => {
    const value = state.birthYear.trim();
    if (!/^\d{4}$/.test(value)) {
      dispatch({ type: "SET_BIRTH_YEAR_ERROR", message: "출생연도는 4자리로 입력해주세요." });
      return false;
    }

    const year = Number(value);
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      dispatch({ type: "SET_BIRTH_YEAR_ERROR", message: "유효한 출생연도를 입력해주세요." });
      return false;
    }

    dispatch({ type: "SET_BIRTH_YEAR_ERROR", message: "" });
    return true;
  };

  const handleCheckNickname = async () => {
    const nickname = state.nickname.trim();
    if (nickname.length < 2) {
      dispatch({ type: "SET_NICKNAME_ERROR", payload: "닉네임은 최소 2자 이상이어야 합니다." });
      return;
    }

    if (nickname.length > 8) {
      dispatch({ type: "SET_NICKNAME_ERROR", payload: "닉네임은 최대 8자까지 가능합니다." });
      return;
    }

    try {
      setIsCheckingNickname(true);
      dispatch({ type: "SET_CHECKING_NICKNAME", payload: true });
      const response = await authApi.checkNicknameDuplicate(nickname);
      const body = response.data as ApiBody;

      if (body.success) {
        dispatch({ type: "SET_NICKNAME_DUPLICATE_CHECKED", payload: true });
        dispatch({ type: "SET_NICKNAME_ERROR", payload: "" });
        Alert.alert("사용 가능", "이 닉네임은 사용할 수 있어요.");
        return;
      }

      dispatch({ type: "SET_NICKNAME_DUPLICATE_CHECKED", payload: false });
      dispatch({
        type: "SET_NICKNAME_ERROR",
        payload: body.message || "이미 사용 중인 닉네임입니다.",
      });
    } catch (error) {
      dispatch({ type: "SET_NICKNAME_DUPLICATE_CHECKED", payload: false });
      dispatch({
        type: "SET_NICKNAME_ERROR",
        payload: getErrorMessage(error, "닉네임 확인 중 오류가 발생했습니다."),
      });
    } finally {
      setIsCheckingNickname(false);
      dispatch({ type: "SET_CHECKING_NICKNAME", payload: false });
    }
  };

  const handlePickProfileImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("권한 필요", "프로필 이미지를 선택하려면 사진 보관함 권한이 필요해요.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
        aspect: [1, 1],
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;

      setSelectedProfileImage({
        uri: asset.uri,
        name: asset.fileName ?? `register-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      });
      dispatch({ type: "SET_IMAGE_URL", payload: asset.uri });
    } catch {
      Alert.alert("선택 실패", "이미지를 가져오지 못했어요.");
    }
  };

  const handleTakeProfileImage = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("권한 필요", "프로필 이미지를 촬영하려면 카메라 권한이 필요해요.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        aspect: [1, 1],
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;

      setSelectedProfileImage({
        uri: asset.uri,
        name: asset.fileName ?? `register-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      });
      dispatch({ type: "SET_IMAGE_URL", payload: asset.uri });
    } catch {
      Alert.alert("촬영 실패", "이미지를 촬영하지 못했어요.");
    }
  };

  const handleRegisterPassword = async () => {
    const passwordMessage = validatePassword(state.password);
    if (passwordMessage) {
      Alert.alert("입력 확인", passwordMessage);
      return false;
    }

    const confirmMessage = validatePasswordConfirm(state.password, passwordConfirm);
    if (confirmMessage) {
      Alert.alert("입력 확인", confirmMessage);
      return false;
    }

    try {
      setIsSubmitting(true);
      const response = await authApi.registerAppUser({
        email: state.email.trim(),
        password: state.password,
      });
      const body = response.data as ApiBody;

      if (body.success === false || body.failure) {
        Alert.alert("등록 실패", body.message || "비밀번호 설정 중 문제가 발생했습니다.");
        return false;
      }

      return true;
    } catch (error) {
      Alert.alert("등록 실패", getErrorMessage(error, "비밀번호 설정 중 오류가 발생했습니다."));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!state.isNicknameDuplicatedChecked) {
      Alert.alert("입력 확인", "닉네임 중복 확인을 먼저 해주세요.");
      return;
    }

    if (state.themes.length === 0) {
      Alert.alert("입력 확인", "관심 테마를 하나 이상 선택해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = isKakaoRegister
        ? await authApi.registerFinalKaKao({
            code: state.kakaoCode ?? "",
            nickname: state.nickname.trim(),
            themes: state.themes,
            gender: state.gender === "male" ? "MALE" : "FEMALE",
            birthYear: state.birthYear.trim(),
            referrerNickname: state.referralCode.trim(),
          })
        : await authApi.registerFinal({
            email: state.email.trim(),
            nickname: state.nickname.trim(),
            themes: state.themes,
            gender: state.gender === "male" ? "MALE" : "FEMALE",
            birthYear: state.birthYear.trim(),
            referrerNickname: state.referralCode.trim(),
          }, selectedProfileImage);
      const body = response.data as ApiBody;

      if (body.success === false || body.failure) {
        Alert.alert("회원가입 실패", body.message || "회원가입을 완료하지 못했어요.");
        return;
      }

      await queryClient.invalidateQueries({ queryKey: QK.sessionMe });
      void queryClient.refetchQueries({ queryKey: QK.sessionMe });
      dispatch({ type: "RESET" });

      Alert.alert("회원가입 완료", "이제 바로 제주데이를 둘러볼 수 있어요.", [
        { text: "확인", onPress: () => navigation.replace("Main") },
      ]);
    } catch (error) {
      Alert.alert("회원가입 실패", getErrorMessage(error, "회원가입 처리 중 오류가 발생했습니다."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (isKakaoRegister) {
      if (step === 0) {
        if (!state.gender) {
          Alert.alert("입력 확인", "성별을 선택해주세요.");
          return;
        }
        if (!validateBirthYear()) return;
        setStep(1);
        return;
      }

      if (step === 1) {
        if (!state.nickname.trim()) {
          Alert.alert("입력 확인", "닉네임을 입력해주세요.");
          return;
        }
        if (!state.isNicknameDuplicatedChecked) {
          Alert.alert("입력 확인", "닉네임 중복 확인을 먼저 해주세요.");
          return;
        }
        if (!state.referralCode.trim()) {
          dispatch({ type: "SET_REFERRAL_ERROR", payload: "추천인을 입력해주세요. (ex. 제주데이)" });
          return;
        }
        setStep(2);
        return;
      }

      await handleFinalSubmit();
      return;
    }

    if (step === 0) {
      if (!state.authPassed) {
        Alert.alert("이메일 인증 필요", "먼저 이메일 인증을 완료해주세요.");
        return;
      }
      setStep(1);
      return;
    }

    if (step === 1) {
      if (!state.gender) {
        Alert.alert("입력 확인", "성별을 선택해주세요.");
        return;
      }
      if (!validateBirthYear()) return;
      setStep(2);
      return;
    }

    if (step === 2) {
      const okay = await handleRegisterPassword();
      if (okay) setStep(3);
      return;
    }

    if (step === 3) {
      if (!state.nickname.trim()) {
        Alert.alert("입력 확인", "닉네임을 입력해주세요.");
        return;
      }
      if (!state.isNicknameDuplicatedChecked) {
        Alert.alert("입력 확인", "닉네임 중복 확인을 먼저 해주세요.");
        return;
      }
      if (!state.referralCode.trim()) {
        dispatch({ type: "SET_REFERRAL_ERROR", payload: "추천인을 입력해주세요. (ex. 제주데이)" });
        return;
      }
      setStep(4);
      return;
    }

    await handleFinalSubmit();
  };

  const handleBack = () => {
    if (step === 0) {
      navigation.goBack();
      return;
    }
    setStep((prev) => prev - 1);
  };

  const toggleTheme = (theme: string) => {
    if (state.themes.includes(theme)) {
      dispatch({
        type: "SET_THEMES",
        payload: state.themes.filter((item) => item !== theme),
      });
      return;
    }

    if (state.themes.length >= 3) {
      Alert.alert("선택 제한", "테마는 최대 3개까지 선택할 수 있어요.");
      return;
    }

    dispatch({ type: "SET_THEMES", payload: [...state.themes, theme] });
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.stepBar}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View key={index} style={[styles.stepItem, index <= step && styles.stepItemActive]} />
            ))}
          </View>
          <Text style={styles.title}>{stepTitle}</Text>
        </View>

        <View style={styles.form}>
          {step === 0 && !isKakaoRegister && (
            <View style={styles.section}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                value={state.email}
                onChangeText={(value) => dispatch({ type: "SET_EMAIL", value })}
                onBlur={() => dispatch({ type: "VALIDATE_EMAIL" })}
                placeholder="you@example.com"
                placeholderTextColor="#a0a0a0"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
              {!!state.emailError && <Text style={styles.errorText}>{state.emailError}</Text>}

              <Pressable style={styles.secondaryButton} onPress={handleSendCode} disabled={isSendingCode}>
                {isSendingCode ? (
                  <ActivityIndicator color="#8b532f" />
                ) : (
                  <Text style={styles.secondaryButtonText}>인증번호 받기</Text>
                )}
              </Pressable>

              {state.showAuthInput && (
                <>
                  <Text style={[styles.label, styles.inlineTop]}>인증번호</Text>
                  <TextInput
                    value={state.authCode}
                    onChangeText={(value) => dispatch({ type: "SET_AUTH_CODE", value })}
                    placeholder="이메일로 받은 코드 입력"
                    placeholderTextColor="#a0a0a0"
                    style={styles.input}
                  />
                  {!!state.authError && <Text style={styles.errorText}>{state.authError}</Text>}

                  <Pressable
                    style={styles.secondaryButton}
                    onPress={handleVerifyCode}
                    disabled={isVerifyingCode}
                  >
                    {isVerifyingCode ? (
                      <ActivityIndicator color="#8b532f" />
                    ) : (
                      <Text style={styles.secondaryButtonText}>
                        {state.authPassed ? "인증 완료" : "인증 확인"}
                      </Text>
                    )}
                  </Pressable>
                </>
              )}
            </View>
          )}

          {(isKakaoRegister ? step === 0 : step === 1) && (
            <View style={styles.section}>
              {isKakaoRegister ? (
                <>
                  <Text style={styles.label}>카카오 계정</Text>
                  <View style={styles.kakaoInfoBox}>
                    <Text style={styles.kakaoInfoText}>{state.kakaoEmail || "이메일 정보 없음"}</Text>
                  </View>
                </>
              ) : null}
              <Text style={styles.label}>성별</Text>
              <View style={styles.segmentRow}>
                <SegmentButton
                  active={state.gender === "male"}
                  label="남성"
                  onPress={() => dispatch({ type: "SET_GENDER", value: "male" })}
                />
                <SegmentButton
                  active={state.gender === "female"}
                  label="여성"
                  onPress={() => dispatch({ type: "SET_GENDER", value: "female" })}
                />
              </View>

              <Text style={[styles.label, styles.inlineTop]}>출생연도</Text>
              <TextInput
                value={state.birthYear}
                onChangeText={(value) => dispatch({ type: "SET_BIRTH_YEAR", value })}
                placeholder="예: 1998"
                placeholderTextColor="#a0a0a0"
                keyboardType="number-pad"
                maxLength={4}
                style={styles.input}
              />
              {!!state.birthYearError && <Text style={styles.errorText}>{state.birthYearError}</Text>}
            </View>
          )}

          {!isKakaoRegister && step === 2 && (
            <View style={styles.section}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                value={state.password}
                onChangeText={(value) => dispatch({ type: "SET_PASSWORD", value })}
                placeholder="8자 이상 입력"
                placeholderTextColor="#a0a0a0"
                secureTextEntry
                style={styles.input}
              />

              <Text style={[styles.label, styles.inlineTop]}>비밀번호 확인</Text>
              <TextInput
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                placeholder="한 번 더 입력"
                placeholderTextColor="#a0a0a0"
                secureTextEntry
                style={styles.input}
              />
            </View>
          )}

          {(isKakaoRegister ? step === 1 : step === 3) && (
            <View style={styles.section}>
              {!isKakaoRegister ? (
                <>
                  <Text style={styles.label}>프로필 이미지</Text>
                  <View style={styles.profileImageSection}>
                    {state.imageUrl ? (
                      <Image source={{ uri: state.imageUrl }} style={styles.profilePreview} />
                    ) : (
                      <View style={styles.profilePreviewFallback}>
                        <Text style={styles.profilePreviewFallbackText}>프로필</Text>
                      </View>
                    )}
                    <View style={styles.profileButtonColumn}>
                      <Pressable style={styles.secondaryButton} onPress={handlePickProfileImage}>
                        <Text style={styles.secondaryButtonText}>이미지 선택</Text>
                      </Pressable>
                      <Pressable style={styles.secondaryButton} onPress={handleTakeProfileImage}>
                        <Text style={styles.secondaryButtonText}>지금 촬영</Text>
                      </Pressable>
                    </View>
                  </View>
                </>
              ) : (
                <Text style={styles.profileNotice}>
                  카카오 가입은 닉네임, 추천인, 관심 테마를 입력하면 완료됩니다.
                </Text>
              )}

              <Text style={styles.label}>닉네임</Text>
              <TextInput
                value={state.nickname}
                onChangeText={(value) => {
                  dispatch({ type: "SET_NICKNAME", value });
                  dispatch({ type: "SET_NICKNAME_DUPLICATE_CHECKED", payload: false });
                  dispatch({ type: "SET_NICKNAME_ERROR", payload: "" });
                }}
                placeholder="2자 이상 8자 이하"
                placeholderTextColor="#a0a0a0"
                style={styles.input}
              />
              {!!state.nicknameError && <Text style={styles.errorText}>{state.nicknameError}</Text>}

              <Pressable
                style={styles.secondaryButton}
                onPress={handleCheckNickname}
                disabled={isCheckingNickname}
              >
                {isCheckingNickname ? (
                  <ActivityIndicator color="#8b532f" />
                ) : (
                  <Text style={styles.secondaryButtonText}>
                    {state.isNicknameDuplicatedChecked ? "확인 완료" : "닉네임 중복 확인"}
                  </Text>
                )}
              </Pressable>

              <Text style={[styles.label, styles.inlineTop]}>추천인</Text>
              <TextInput
                value={state.referralCode}
                onChangeText={(value) => {
                  dispatch({ type: "SET_REFERRAL_CODE", payload: value });
                  dispatch({
                    type: "SET_REFERRAL_ERROR",
                    payload: value.trim() ? "" : "추천인을 입력해주세요. (ex. 제주데이)",
                  });
                }}
                placeholder="예: 제주데이"
                placeholderTextColor="#a0a0a0"
                style={styles.input}
              />
              {!!state.referralError && <Text style={styles.errorText}>{state.referralError}</Text>}
            </View>
          )}

          {(isKakaoRegister ? step === 2 : step === 4) && (
            <View style={styles.section}>
              <Text style={styles.label}>관심 테마</Text>
              <Text style={styles.helperText}>최대 3개까지 선택할 수 있어요.</Text>
              <View style={styles.themeGrid}>
                {THEME_OPTIONS.map((theme) => {
                  const active = state.themes.includes(theme);
                  return (
                    <Pressable
                      key={theme}
                      style={[styles.themeChip, active && styles.themeChipActive]}
                      onPress={() => toggleTheme(theme)}
                    >
                      <Text style={[styles.themeChipText, active && styles.themeChipTextActive]}>
                        {theme}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.footerRow}>
            <Pressable style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>{step === 0 ? "뒤로" : "이전"}</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
              onPress={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {step === totalSteps - 1 ? "회원가입 완료" : "다음"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SegmentButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.segmentButton, active && styles.segmentButtonActive]} onPress={onPress}>
      <Text style={[styles.segmentButtonText, active && styles.segmentButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.bg[0],
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 7,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  stepBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingTop: 7,
    paddingBottom: 22,
    gap: 4,
  },
  stepItem: {
    flex: 1,
    height: 3,
    borderRadius: 50,
    backgroundColor: colors.gray[300],
  },
  stepItemActive: {
    backgroundColor: colors.primary[400],
  },
  title: {
    ...typography.head3,
    color: colors.gray[800],
  },
  form: {
    flex: 1,
  },
  section: {
    minHeight: 360,
  },
  label: {
    ...typography.body3,
    color: colors.gray[700],
  },
  inlineTop: {
    marginTop: 18,
  },
  input: {
    ...commonStyles.input,
    marginTop: 8,
  },
  errorText: {
    marginTop: 6,
    ...typography.caption2,
    color: colors.error[100],
  },
  helperText: {
    marginTop: 6,
    ...typography.caption2,
    color: colors.gray[500],
  },
  kakaoInfoBox: {
    marginBottom: 16,
    marginTop: 8,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: "center",
    backgroundColor: colors.gray[100],
  },
  kakaoInfoText: {
    ...typography.body4,
    color: colors.gray[600],
  },
  profileNotice: {
    marginBottom: 16,
    ...typography.caption1,
    color: colors.gray[600],
  },
  profileImageSection: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  profilePreview: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.gray[200],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  profilePreviewFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[200],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  profilePreviewFallbackText: {
    ...typography.caption1,
    color: colors.gray[500],
  },
  profileButtonColumn: {
    width: "100%",
    gap: 10,
  },
  secondaryButton: {
    marginTop: 12,
    minHeight: 48,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.bg[0],
  },
  secondaryButtonText: {
    ...typography.body1,
    color: colors.gray[700],
  },
  segmentRow: {
    flexDirection: "row",
    gap: 14,
    width: "100%",
    marginTop: 10,
    marginBottom: 32,
  },
  segmentButton: {
    flex: 1,
    minHeight: 72,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.bg[0],
  },
  segmentButtonActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[300],
  },
  segmentButtonText: {
    ...typography.body2,
    color: colors.gray[500],
  },
  segmentButtonTextActive: {
    ...typography.body1,
    color: colors.primary[400],
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
    marginTop: 59,
  },
  themeChip: {
    width: "30.8%",
    minHeight: 68,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg[0],
  },
  themeChipActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[300],
  },
  themeChipText: {
    ...typography.body3,
    color: colors.gray[500],
    textAlign: "center",
  },
  themeChipTextActive: {
    color: colors.primary[400],
  },
  footerRow: {
    flexDirection: "row",
    gap: 15,
    marginTop: 8,
  },
  backButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[100],
  },
  backButtonText: {
    ...typography.body1,
    color: colors.gray[400],
  },
  primaryButton: {
    flex: 2,
    minHeight: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[400],
  },
  primaryButtonDisabled: {
    backgroundColor: colors.gray[100],
  },
  primaryButtonText: {
    ...typography.body1,
    color: colors.base[0],
  },
});
