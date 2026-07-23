import { StyleSheet, View } from "react-native";
import { colors } from "src/design/theme";

type Props = {
  totalSteps: number;
  currentStep: number;
  title: string;
};

export function RegisterStepBar({ totalSteps, currentStep }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.stepBar}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View key={index} style={[styles.stepItem, index === currentStep && styles.stepItemActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 0,
  },
  stepBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingTop: 7,
    paddingBottom: 22,
    gap: 4,
  },
  stepItem: {
    flex: 1,
    height: 3,
    borderRadius: 50,
    backgroundColor: colors.gray[300],
  },
  stepItemActive: {
    backgroundColor: colors.primary[400],
  },
});
