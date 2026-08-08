import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LocationPin from "src/assets/Location.svg";
import { colors, shadow, typography } from "src/design/theme";

type Props = {
  isConfirming: boolean;
  onConfirm: () => void;
};

export function MapLocationPicker({ isConfirming, onConfirm }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <View style={styles.centerPin} pointerEvents="none">
        <LocationPin width={36} height={36} />
      </View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={styles.hint}>지도를 움직여 위치를 맞춰주세요.</Text>
        <Pressable style={styles.confirmButton} onPress={onConfirm} disabled={isConfirming}>
          {isConfirming ? (
            <ActivityIndicator color={colors.base[0]} />
          ) : (
            <Text style={styles.confirmButtonText}>이 위치로 선택</Text>
          )}
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  centerPin: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -18,
    marginTop: -36,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 10,
    backgroundColor: colors.bg[0],
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    ...shadow.card,
  },
  hint: {
    ...typography.caption1,
    color: colors.gray[600],
    textAlign: "center",
  },
  confirmButton: {
    minHeight: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[400],
  },
  confirmButtonText: {
    ...typography.body1,
    fontWeight: "600",
    color: colors.base[0],
  },
});
