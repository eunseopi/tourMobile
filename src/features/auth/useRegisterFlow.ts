import { useMemo, useReducer, useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { authApi } from "src/api/auth";
import type { RootStackParamList } from "src/app/navigation/types";
import type { Gender, RegisterAction, RegisterState } from "src/types/RegisterTypes";
import type { UploadableImage } from "src/types/SpotTypes";
import { QK } from "src/utils/lib/queryKeys";
import { authStorage } from "src/utils/lib/authStorage";
import { toJpeg } from "src/utils/lib/image";
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
} from "src/utils/validation/authValidation";

type RegisterParams = RootStackParamList["Register"];

type ApiBody<T = unknown> = {
  success?: boolean;
  failure?: boolean;
  message?: string;
  data?: T;
};

type UseRegisterFlowOptions = {
  routeParams: RegisterParams;
  onBack: () => void;
  onComplete: () => void;
};

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
      return { ...state, gender: action.value };
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
    case "SET_KAKAO_CODE":
      return { ...state, kakaoCode: action.payload };
    case "SET_KAKAO_EMAIL":
      return { ...state, kakaoEmail: action.payload };
    case "SET_KAKAO_NICKNAME":
      return { ...state, kakaoNickname: action.payload };
    case "RESET":
      return initialRegisterState;
    default:
      return state;
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message || (error instanceof Error ? error.message : fallback);
}

export function useRegisterFlow({ routeParams, onBack, onComplete }: UseRegisterFlowOptions) {
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
  }, [isKakaoRegister, step]);

  const totalSteps = isKakaoRegister ? 3 : 5;

  const canProceed = useMemo(() => {
    if (isSubmitting) return false;

    if (isKakaoRegister) {
      if (step === 0) return !!state.gender && /^\d{4}$/.test(state.birthYear.trim());
      if (step === 1) {
        return (
          state.nickname.trim().length >= 2 &&
          state.isNicknameDuplicatedChecked &&
          !!state.referralCode.trim()
        );
      }
      return state.themes.length > 0;
    }

    if (step === 0) return state.authPassed;
    if (step === 1) return !!state.gender && /^\d{4}$/.test(state.birthYear.trim());
    if (step === 2) {
      return !validatePassword(state.password) && !validatePasswordConfirm(state.password, passwordConfirm);
    }
    if (step === 3) {
      return (
        state.nickname.trim().length >= 2 &&
        state.isNicknameDuplicatedChecked &&
        !!state.referralCode.trim()
      );
    }
    return state.themes.length > 0;
  }, [
    isKakaoRegister,
    isSubmitting,
    passwordConfirm,
    state.authPassed,
    state.birthYear,
    state.gender,
    state.isNicknameDuplicatedChecked,
    state.nickname,
    state.password,
    state.referralCode,
    state.themes.length,
    step,
  ]);

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

  const handleChangeEmail = (value: string) => {
    dispatch({ type: "SET_EMAIL", value });
  };

  const handleBlurEmail = () => {
    dispatch({ type: "VALIDATE_EMAIL" });
  };

  const handleChangeAuthCode = (value: string) => {
    dispatch({ type: "SET_AUTH_CODE", value });
  };

  const handleChangeGender = (value: Exclude<Gender, "">) => {
    dispatch({ type: "SET_GENDER", value });
  };

  const handleChangeBirthYear = (value: string) => {
    dispatch({ type: "SET_BIRTH_YEAR", value });
  };

  const handleChangePassword = (value: string) => {
    dispatch({ type: "SET_PASSWORD", value });
  };

  const handleChangeNickname = (value: string) => {
    dispatch({ type: "SET_NICKNAME", value });
    dispatch({ type: "SET_NICKNAME_DUPLICATE_CHECKED", payload: false });
    dispatch({ type: "SET_NICKNAME_ERROR", payload: "" });
  };

  const handleChangeReferralCode = (value: string) => {
    dispatch({ type: "SET_REFERRAL_CODE", payload: value });
    dispatch({
      type: "SET_REFERRAL_ERROR",
      payload: value.trim() ? "" : "추천인을 입력해주세요. (ex. 제주데이)",
    });
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

      await authApi.sendEmailCode(state.email.trim());

      dispatch({ type: "CHECK_DUPLICATE_SUCCESS" });
      dispatch({ type: "SHOW_AUTH_INPUT" });
      dispatch({ type: "SET_EMAIL_ERROR", message: "" });

      Alert.alert("인증번호 발송", "입력하신 이메일로 인증번호를 보냈어요.");
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
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        quality: 0.8,
        aspect: [1, 1],
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;

      const { uri } = await toJpeg(asset.uri);
      setSelectedProfileImage({
        uri,
        name: `register-${Date.now()}.jpg`,
        type: "image/jpeg",
      });
      dispatch({ type: "SET_IMAGE_URL", payload: uri });
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
        mediaTypes: ["images"],
        quality: 0.8,
        aspect: [1, 1],
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;

      const { uri } = await toJpeg(asset.uri);
      setSelectedProfileImage({
        uri,
        name: `register-${Date.now()}.jpg`,
        type: "image/jpeg",
      });
      dispatch({ type: "SET_IMAGE_URL", payload: uri });
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
        : await authApi.registerFinal(
            {
              email: state.email.trim(),
              nickname: state.nickname.trim(),
              themes: state.themes,
              gender: state.gender === "male" ? "MALE" : "FEMALE",
              birthYear: state.birthYear.trim(),
              referrerNickname: state.referralCode.trim(),
            },
            selectedProfileImage,
          );
      const body = response.data as ApiBody;

      if (body.success === false || body.failure) {
        Alert.alert("회원가입 실패", body.message || "회원가입을 완료하지 못했어요.");
        return;
      }

      await queryClient.invalidateQueries({ queryKey: QK.sessionMe });
      void queryClient.refetchQueries({ queryKey: QK.sessionMe });
      await authStorage.markLoginNow();
      dispatch({ type: "RESET" });

      Alert.alert("회원가입 완료", "이제 바로 제주데이를 둘러볼 수 있어요.", [
        { text: "확인", onPress: onComplete },
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
      onBack();
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

  return {
    state,
    step,
    stepTitle,
    totalSteps,
    canProceed,
    isKakaoRegister,
    passwordConfirm,
    isSendingCode,
    isVerifyingCode,
    isCheckingNickname,
    isSubmitting,
    handleBack,
    handleNext,
    handleChangeEmail,
    handleBlurEmail,
    handleChangeAuthCode,
    handleSendCode,
    handleVerifyCode,
    handleChangeGender,
    handleChangeBirthYear,
    handleChangePassword,
    setPasswordConfirm,
    handlePickProfileImage,
    handleTakeProfileImage,
    handleChangeNickname,
    handleCheckNickname,
    handleChangeReferralCode,
    toggleTheme,
  };
}
