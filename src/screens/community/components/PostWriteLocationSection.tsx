import { Pressable, StyleSheet, Text, View } from "react-native";
import { FormTextField } from "src/components/form/FormTextField";
import { colors } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";
import LocationIcon from "src/assets/Location.svg";

type Props = {
  name: string;
  latitude: number;
  longitude: number;
  error?: string;
  onChangeName: (value: string) => void;
  onUseCurrentLocation: () => void;
};

export function PostWriteLocationSection({
  name,
  latitude,
  longitude,
  error,
  onChangeName,
  onUseCurrentLocation,
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

      <Pressable style={styles.secondaryButton} onPress={onUseCurrentLocation}>
        <Text style={styles.secondaryButtonText}>현재 위치로 채우기</Text>
      </Pressable>

      {latitude !== 0 && longitude !== 0 ? (
        <Text style={styles.coordinateText}>
          좌표: {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </Text>
      ) : null}
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
  secondaryButton: {
    ...commonStyles.secondaryButton,
    marginTop: 12,
  },
  secondaryButtonText: {
    ...commonStyles.secondaryButtonText,
  },
  coordinateText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.gray[500],
    marginTop: 10,
  },
});
