import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { useAppPreferenceStore } from "src/stores/appPreferenceStore";
import { colors, layout, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";
import Logo from "src/assets/Logo.svg";
import Korea from "src/assets/Korea.svg";
import English from "src/assets/English.svg";

type Props = NativeStackScreenProps<RootStackParamList, "LanguageSetting">;

const LANGUAGES = [
  { key: "ko", label: "한국어", Icon: Korea },
  { key: "en", label: "English", Icon: English },
] as const;

export default function LanguageSettingScreen({ navigation }: Props) {
  const setLanguage = useAppPreferenceStore((state) => state.setLanguage);
  const [selected, setSelected] = useState<"ko" | "en">("ko");

  return (
    <View style={styles.container}>
      <ScreenHeader title="언어 설정" />
      <View style={styles.logoHeader}>
        <Logo width={40} height={40} />
      </View>
      <View style={styles.body}>
        <Text style={styles.guide}>하루제주에 입장 전{"\n"}언어를 선택해주세요.</Text>
        <View style={styles.options}>
          {LANGUAGES.map((item) => {
            const active = selected === item.key;
            const Icon = item.Icon;
            return (
              <Pressable
                key={item.key}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => setSelected(item.key)}
              >
                <View style={styles.optionLeft}>
                  <Icon width={24} height={24} />
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{item.label}</Text>
                </View>
                <Text style={[styles.checkIcon, active && styles.checkIconActive]}>{"✓"}</Text>
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
  logoHeader: {
    paddingTop: 28,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 35,
  },
  body: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
  },
  guide: {
    ...typography.head2,
    color: colors.gray[800],
  },
  options: {
    marginTop: 20,
    gap: 12,
  },
  option: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 17,
    paddingHorizontal: 17,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.bg[0],
  },
  optionActive: {
    borderColor: colors.primary[300],
    backgroundColor: colors.primary[50],
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  optionText: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "600",
    color: colors.gray[600],
  },
  optionTextActive: {
    color: colors.primary[400],
  },
  checkIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.gray[300],
  },
  checkIconActive: {
    color: colors.primary[400],
  },
});
