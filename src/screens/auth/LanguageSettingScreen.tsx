import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { useAppPreferenceStore } from "src/stores/appPreferenceStore";
import { colors, layout, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";

type Props = NativeStackScreenProps<RootStackParamList, "LanguageSetting">;

const LANGUAGES = [
  { key: "ko", label: "한국어" },
  { key: "en", label: "English" },
] as const;

export default function LanguageSettingScreen({ navigation }: Props) {
  const setLanguage = useAppPreferenceStore((state) => state.setLanguage);
  const [selected, setSelected] = useState<"ko" | "en">("ko");

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Text style={styles.guide}>하루제주에 입장 전{"\n"}언어를 선택해주세요.</Text>
        <View style={styles.options}>
          {LANGUAGES.map((item) => {
            const active = selected === item.key;
            return (
              <Pressable
                key={item.key}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => setSelected(item.key)}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={commonStyles.bottomAction}>
        <Pressable
          style={commonStyles.primaryButton}
          onPress={() => {
            setLanguage(selected);
            navigation.replace("Permission");
          }}
        >
          <Text style={commonStyles.primaryButtonText}>다음</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg[0] },
  body: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 96,
  },
  guide: {
    ...typography.head2,
    color: colors.gray[800],
  },
  options: {
    marginTop: 20,
    gap: 10,
  },
  option: {
    height: 48,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg[0],
  },
  optionActive: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },
  optionText: {
    ...typography.body1,
    color: colors.gray[700],
  },
  optionTextActive: {
    color: colors.primary[400],
  },
});
