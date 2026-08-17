import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { commonStyles } from "src/design/commonStyles";
import { colors, layout, typography } from "src/design/theme";
import { TERMS_OF_SERVICE_CONTENT } from "src/config/legalContent";

type Props = NativeStackScreenProps<RootStackParamList, "Terms">;

export default function TermsScreen({}: Props) {
  return (
    <View style={commonStyles.screen}>
      <ScreenHeader title="이용약관" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.body}>{TERMS_OF_SERVICE_CONTENT}</Text>
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
