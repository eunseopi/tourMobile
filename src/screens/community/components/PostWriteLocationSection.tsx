import { Pressable, StyleSheet, Text, View } from "react-native";
import { FormTextField } from "src/components/form/FormTextField";
import { colors } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";
import LocationIcon from "src/assets/Location.svg";

type Props = {
  name: string;
  error?: string;
  onChangeName: (value: string) => void;
  onUseCurrentLocation: () => void;
  onPickOnMap: () => void;
};

export function PostWriteLocationSection({
  name,
  error,
  onChangeName,
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
        onChangeText={onChangeName}
        placeholder="현재 위치 입력"
        error={error}
      />

      <View style={styles.buttonRow}>
        <Pressable style={[styles.secondaryButton, styles.buttonFlex]} onPress={onUseCurrentLocation}>
          <Text style={styles.secondaryButtonText}>현재 위치로 채우기</Text>
        </Pressable>
        <Pressable style={[styles.secondaryButton, styles.buttonFlex]} onPress={onPickOnMap}>
          <Text style={styles.secondaryButtonText}>지도에서 위치 선택하기</Text>
        </Pressable>
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
