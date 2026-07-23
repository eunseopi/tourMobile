import { Pressable, StyleSheet, Text, View } from "react-native";
import { FormTextField } from "src/components/form/FormTextField";
import { colors, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";

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
      <Text style={styles.sectionTitle}>위치</Text>
      <FormTextField
        value={name}
        onChangeText={onChangeName}
        placeholder="장소명을 입력해주세요."
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
    marginBottom: 22,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
  },
  sectionTitle: {
    ...typography.head4,
    color: colors.gray[800],
    marginBottom: 10,
  },
  secondaryButton: {
    ...commonStyles.secondaryButton,
    marginTop: 12,
  },
  secondaryButtonText: {
    ...commonStyles.secondaryButtonText,
  },
  coordinateText: {
    ...typography.caption2,
    color: colors.gray[500],
    marginTop: 10,
  },
});
