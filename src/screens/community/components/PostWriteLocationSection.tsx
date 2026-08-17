import { StyleSheet, Text, View } from "react-native";
import { FormTextField } from "src/components/form/FormTextField";
import { PressableScale } from "src/components/ui/PressableScale";
import { colors } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";
import LocationIcon from "src/assets/Location.svg";

type Props = {
  name: string;
  error?: string;
  onUseCurrentLocation: () => void;
  onPickOnMap: () => void;
};

// 위치 이름을 직접 타이핑하게 두면 좌표 없이(위도/경도 0,0) 글이 등록되거나 실제
// 위치와 다른 이름이 붙는 문제가 있어서, "현재 위치로 채우기"/"지도에서 선택하기"로
// 좌표까지 함께 채워진 값만 쓸 수 있도록 입력을 막고 읽기 전용으로만 보여준다.
export function PostWriteLocationSection({
  name,
  error,
  onUseCurrentLocation,
  onPickOnMap,
}: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <LocationIcon width={18} height={18} />
        <Text style={styles.sectionTitle}>위치를 알려주세요.<Text style={styles.required}>*</Text></Text>
      </View>
      <FormTextField
        value={name}
        editable={false}
        placeholder="아래 버튼으로 위치를 선택해주세요"
        error={error}
      />

      <View style={styles.buttonRow}>
        <PressableScale style={[styles.secondaryButton, styles.buttonFlex]} onPress={onUseCurrentLocation}>
          <Text style={styles.secondaryButtonText}>현재 위치로 채우기</Text>
        </PressableScale>
        <PressableScale style={[styles.secondaryButton, styles.buttonFlex]} onPress={onPickOnMap}>
          <Text style={styles.secondaryButtonText}>지도에서 위치 선택하기</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    color: colors.gray[800],
  },
  required: {
    color: colors.primary[400],
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  buttonFlex: {
    flex: 1,
    marginTop: 0,
  },
  secondaryButton: {
    ...commonStyles.secondaryButton,
    marginTop: 12,
  },
  secondaryButtonText: {
    ...commonStyles.secondaryButtonText,
  },
});
