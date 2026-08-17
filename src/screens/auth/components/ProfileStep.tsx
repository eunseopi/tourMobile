import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";
import { ProfileImagePicker } from "src/components/profile/ProfileImagePicker";
import { PressableScale } from "src/components/ui/PressableScale";

type Props = {
  isKakaoRegister: boolean;
  imageUrl?: string;
  nickname: string;
  nicknameError?: string;
  referralCode: string;
  referralError?: string;
  isCheckingNickname: boolean;
  isNicknameDuplicatedChecked: boolean;
  onPickImage: () => void;
  onTakeImage: () => void;
  onChangeNickname: (value: string) => void;
  onCheckNickname: () => void;
  onChangeReferralCode: (value: string) => void;
};

export function ProfileStep({
  isKakaoRegister,
  imageUrl,
  nickname,
  nicknameError,
  referralCode,
  referralError,
  isCheckingNickname,
  isNicknameDuplicatedChecked,
  onPickImage,
  onTakeImage,
  onChangeNickname,
  onCheckNickname,
  onChangeReferralCode,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>프로필을 설정해주세요.</Text>
      {!isKakaoRegister ? (
        <ProfileImagePicker imageUri={imageUrl} onPickImage={onPickImage} onTakeImage={onTakeImage} />
      ) : (
        <Text style={styles.profileNotice}>카카오 가입은 닉네임, 추천인, 관심 테마를 입력하면 완료됩니다.</Text>
      )}

      <Text style={styles.label}>닉네임을 입력해주세요.</Text>
      <TextInput
        value={nickname}
        onChangeText={onChangeNickname}
        placeholder="최대 8자까지 가능해요."
        placeholderTextColor="#a0a0a0"
        style={styles.input}
      />
      {!!nicknameError && <Text style={styles.errorText}>{nicknameError}</Text>}

      <PressableScale style={styles.secondaryButton} onPress={onCheckNickname} disabled={isCheckingNickname}>
        {isCheckingNickname ? (
          <ActivityIndicator color="#8b532f" />
        ) : (
          <Text style={styles.secondaryButtonText}>{isNicknameDuplicatedChecked ? "확인 완료" : "중복확인"}</Text>
        )}
      </PressableScale>

      <Text style={[styles.label, styles.inlineTop]}>추천인을 입력해주세요.</Text>
      <TextInput
        value={referralCode}
        onChangeText={onChangeReferralCode}
        placeholder="예: 제주데이"
        placeholderTextColor="#a0a0a0"
        style={styles.input}
      />
      {!!referralError && <Text style={styles.errorText}>{referralError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    minHeight: 360,
  },
  label: {
    ...typography.body3,
    color: colors.gray[700],
  },
  heading: {
    ...typography.head3,
    color: colors.gray[800],
    marginBottom: 20,
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
  profileNotice: {
    marginBottom: 16,
    ...typography.caption1,
    color: colors.gray[600],
  },
  secondaryButton: {
    ...commonStyles.secondaryButton,
    marginTop: 12,
  },
  secondaryButtonText: {
    ...commonStyles.secondaryButtonText,
  },
});
