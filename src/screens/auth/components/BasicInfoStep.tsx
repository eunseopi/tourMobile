import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";

type GenderValue = "male" | "female" | "";

type Props = {
  isKakaoRegister: boolean;
  kakaoEmail?: string | null;
  gender: GenderValue;
  birthYear: string;
  birthYearError?: string;
  onChangeGender: (gender: Exclude<GenderValue, "">) => void;
  onChangeBirthYear: (value: string) => void;
};

export function BasicInfoStep({
  isKakaoRegister,
  kakaoEmail,
  gender,
  birthYear,
  birthYearError,
  onChangeGender,
  onChangeBirthYear,
}: Props) {
  return (
    <View style={styles.section}>
      {isKakaoRegister ? (
        <>
          <Text style={styles.label}>카카오 계정</Text>
          <View style={styles.kakaoInfoBox}>
            <Text style={styles.kakaoInfoText}>{kakaoEmail || "이메일 정보 없음"}</Text>
          </View>
        </>
      ) : null}

      <Text style={styles.heading}>성별을 선택해주세요.</Text>
      <View style={styles.segmentRow}>
        <SegmentButton active={gender === "male"} label="남자" onPress={() => onChangeGender("male")} />
        <SegmentButton active={gender === "female"} label="여자" onPress={() => onChangeGender("female")} />
      </View>

      <Text style={styles.heading}>태어난 연도를 알려주세요.</Text>
      <TextInput
        value={birthYear}
        onChangeText={onChangeBirthYear}
        placeholder="예)1999"
        placeholderTextColor="#a0a0a0"
        keyboardType="number-pad"
        maxLength={4}
        style={styles.input}
      />
      {!!birthYearError && <Text style={styles.errorText}>{birthYearError}</Text>}
    </View>
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
  input: {
    ...commonStyles.input,
    marginTop: 0,
  },
  errorText: {
    marginTop: 6,
    ...typography.caption2,
    color: colors.error[100],
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
    color: colors.gray[600],
  },
  segmentButtonTextActive: {
    ...typography.body1,
    color: colors.primary[400],
  },
});
