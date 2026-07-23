import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { colors, layout } from "src/design/theme";
import { useRegisterFlow } from "src/features/auth/useRegisterFlow";
import { BasicInfoStep } from "./components/BasicInfoStep";
import { EmailStep } from "./components/EmailStep";
import { PasswordStep } from "./components/PasswordStep";
import { ProfileStep } from "./components/ProfileStep";
import { RegisterFooter } from "./components/RegisterFooter";
import { RegisterStepBar } from "./components/RegisterStepBar";
import { ThemeStep } from "./components/ThemeStep";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation, route }: Props) {
  const register = useRegisterFlow({
    routeParams: route.params,
    onBack: () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }
      navigation.replace("RegisterChoice");
    },
    onComplete: () => navigation.replace("Main"),
  });

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <RegisterStepBar
          totalSteps={register.totalSteps}
          currentStep={register.step}
          title={register.stepTitle}
        />

        <View style={styles.form}>
          {register.step === 0 && !register.isKakaoRegister && (
            <EmailStep
              email={register.state.email}
              emailError={register.state.emailError}
              authCode={register.state.authCode}
              authError={register.state.authError}
              showAuthInput={register.state.showAuthInput}
              authPassed={register.state.authPassed}
              isSendingCode={register.isSendingCode}
              isVerifyingCode={register.isVerifyingCode}
              onChangeEmail={register.handleChangeEmail}
              onBlurEmail={register.handleBlurEmail}
              onChangeAuthCode={register.handleChangeAuthCode}
              onSendCode={register.handleSendCode}
              onVerifyCode={register.handleVerifyCode}
            />
          )}

          {(register.isKakaoRegister ? register.step === 0 : register.step === 1) && (
            <BasicInfoStep
              isKakaoRegister={register.isKakaoRegister}
              kakaoEmail={register.state.kakaoEmail}
              gender={register.state.gender}
              birthYear={register.state.birthYear}
              birthYearError={register.state.birthYearError}
              onChangeGender={register.handleChangeGender}
              onChangeBirthYear={register.handleChangeBirthYear}
            />
          )}

          {!register.isKakaoRegister && register.step === 2 && (
            <PasswordStep
              password={register.state.password}
              passwordConfirm={register.passwordConfirm}
              onChangePassword={register.handleChangePassword}
              onChangePasswordConfirm={register.setPasswordConfirm}
            />
          )}

          {(register.isKakaoRegister ? register.step === 1 : register.step === 3) && (
            <ProfileStep
              isKakaoRegister={register.isKakaoRegister}
              imageUrl={register.state.imageUrl}
              nickname={register.state.nickname}
              nicknameError={register.state.nicknameError}
              referralCode={register.state.referralCode}
              referralError={register.state.referralError}
              isCheckingNickname={register.isCheckingNickname}
              isNicknameDuplicatedChecked={register.state.isNicknameDuplicatedChecked}
              onPickImage={register.handlePickProfileImage}
              onTakeImage={register.handleTakeProfileImage}
              onChangeNickname={register.handleChangeNickname}
              onCheckNickname={register.handleCheckNickname}
              onChangeReferralCode={register.handleChangeReferralCode}
            />
          )}

          {(register.isKakaoRegister ? register.step === 2 : register.step === 4) && (
            <ThemeStep selectedThemes={register.state.themes} onToggleTheme={register.toggleTheme} />
          )}

          <RegisterFooter
            step={register.step}
            totalSteps={register.totalSteps}
            isSubmitting={register.isSubmitting}
            onBack={register.handleBack}
            onNext={register.handleNext}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  form: {
    flex: 1,
  },
});
