import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { commonStyles } from "src/design/commonStyles";
import { colors, layout, typography } from "src/design/theme";
import { PRIVACY_POLICY_CONTENT } from "src/config/legalContent";

type Props = NativeStackScreenProps<RootStackParamList, "PrivacyPolicy">;

export default function PrivacyPolicyScreen({}: Props) {
  return (
    <View style={commonStyles.screen}>
      <ScreenHeader title="개인정보 처리방침" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.body}>{PRIVACY_POLICY_CONTENT}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 20,
    paddingBottom: 40,
  },
  body: {
    ...typography.body4,
    color: colors.gray[700],
    lineHeight: 22,
  },
});
