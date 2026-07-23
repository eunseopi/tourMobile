import { StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";

type Props = {
  totalSteps: number;
  currentStep: number;
  title: string;
};

export function RegisterStepBar({ totalSteps, currentStep, title }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.stepBar}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View key={index} style={[styles.stepItem, index <= currentStep && styles.stepItemActive]} />
        ))}
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
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
  title: {
    ...typography.head3,
    color: colors.gray[800],
  },
});
