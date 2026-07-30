import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, shadow, typography } from "src/design/theme";
import EmptyBuddy from "src/assets/emptyBuddy.svg";

type Props = PropsWithChildren<{
  title: string;
  meta?: string;
  description?: string;
  linkLabel?: string;
  onPressLink?: () => void;
  headerRight?: ReactNode;
}>;

export function HomeSection({ title, meta, description, linkLabel, onPressLink, headerRight, children }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {headerRight ?? (linkLabel && onPressLink ? (
          <Pressable onPress={onPressLink}>
            <Text style={styles.linkText}>{linkLabel}</Text>
          </Pressable>
        ) : meta ? (
          <Text style={styles.sectionMeta}>{meta}</Text>
        ) : null)}
      </View>
      {description ? <Text style={styles.sectionDescription}>{description}</Text> : null}
      {children}
    </View>
  );
}

export function SectionState({ children }: PropsWithChildren) {
  return (
    <View style={styles.centerBox}>
      <EmptyBuddy width={64} height={64} />
      <Text style={styles.centerText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 20, padding: 16, borderRadius: 12, backgroundColor: colors.bg[0], ...shadow.card },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { ...typography.head3, color: colors.gray[800] },
  sectionMeta: { ...typography.caption2, color: colors.gray[500] },
  sectionDescription: { ...typography.body4, color: colors.gray[600], marginTop: 8 },
  linkText: { ...typography.body3, color: colors.primary[400] },
  centerBox: { paddingVertical: 22, alignItems: "center", justifyContent: "center" },
  centerText: { ...typography.body4, color: colors.gray[500], marginTop: 10 },
});
