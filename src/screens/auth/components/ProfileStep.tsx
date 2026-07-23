import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";

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
      {!isKakaoRegister ? (
        <>
          <Text style={styles.label}>프로필 이미지</Text>
          <View style={styles.profileImageSection}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.profilePreview} />
            ) : (
              <View style={styles.profilePreviewFallback}>
                <Text style={styles.profilePreviewFallbackText}>프로필</Text>
              </View>
            )}
            <View style={styles.profileButtonColumn}>
              <Pressable style={styles.secondaryButton} onPress={onPickImage}>
                <Text style={styles.secondaryButtonText}>이미지 선택</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={onTakeImage}>
                <Text style={styles.secondaryButtonText}>지금 촬영</Text>
              </Pressable>
            </View>
          </View>
        </>
      ) : (
        <Text style={styles.profileNotice}>카카오 가입은 닉네임, 추천인, 관심 테마를 입력하면 완료됩니다.</Text>
      )}

      <Text style={styles.label}>닉네임</Text>
      <TextInput
        value={nickname}
        onChangeText={onChangeNickname}
        placeholder="2자 이상 8자 이하"
        placeholderTextColor="#a0a0a0"
        style={styles.input}
      />
      {!!nicknameError && <Text style={styles.errorText}>{nicknameError}</Text>}

      <Pressable style={styles.secondaryButton} onPress={onCheckNickname} disabled={isCheckingNickname}>
        {isCheckingNickname ? (
          <ActivityIndicator color="#8b532f" />
        ) : (
          <Text style={styles.secondaryButtonText}>
            {isNicknameDuplicatedChecked ? "확인 완료" : "닉네임 중복 확인"}
          </Text>
        )}
      </Pressable>

      <Text style={[styles.label, styles.inlineTop]}>추천인</Text>
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
    ...commonStyles.secondaryButton,
    marginTop: 12,
  },
  secondaryButtonText: {
    ...commonStyles.secondaryButtonText,
  },
});
