import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Alert } from "src/components/ui/AppAlert";
import type { RootStackParamList } from "src/app/navigation/types";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { SUPPORT_EMAIL } from "src/config/contact";
import { commonStyles } from "src/design/commonStyles";
import { colors, layout, shadow, typography } from "src/design/theme";

const INQUIRY_TOPICS = [
  "챌린지 인증, 지도, 커뮤니티 게시글 등 기능 관련 오류 신고",
  "계정·로그인·한라봉(포인트)·쿠폰 교환 문의",
  "부적절한 게시물·댓글 신고",
  "제휴·비즈니스 제안",
  "계정·개인정보 문의",
];

type Props = NativeStackScreenProps<RootStackParamList, "Contact">;

export default function ContactScreen({ navigation }: Props) {
  const handleEmailPress = () => {
    Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("[하루제주] 문의사항")}`
    ).catch(() => {
      Alert.alert("문의하기", `메일 앱을 열지 못했어요. ${SUPPORT_EMAIL}로 문의해주세요.`);
    });
  };

  return (
    <View style={commonStyles.screen}>
      <ScreenHeader title="문의하기" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          서비스 이용 중 궁금한 점, 오류 신고, 제휴·제안은 아래 이메일로 연락해주세요. 영업일 기준
          2~3일 내에 답변드립니다.
        </Text>

        <Pressable style={styles.emailCard} onPress={handleEmailPress}>
          <Text style={styles.emailLabel}>이메일로 문의</Text>
          <Text style={styles.emailValue}>{SUPPORT_EMAIL}</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>이런 문의를 받아요</Text>
        <View style={styles.topicList}>
          {INQUIRY_TOPICS.map((topic) => (
            <View key={topic} style={styles.topicRow}>
              <Text style={styles.topicBullet}>{"•"}</Text>
              <Text style={styles.topicText}>{topic}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footnote}>
          계정 삭제, 저장된 개인정보 관련 요청은{" "}
          <Text style={styles.footnoteLink} onPress={() => navigation.navigate("PrivacyPolicy")}>
            개인정보 처리방침
          </Text>{" "}
          페이지의 안내를 함께 참고해주세요. 로그인 회원은 마이페이지의 회원탈퇴 메뉴에서 직접
          처리할 수도 있습니다.
        </Text>
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
  description: {
    ...typography.body4,
    color: colors.gray[700],
    lineHeight: 22,
    marginBottom: 20,
  },
  emailCard: {
    padding: 18,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
    marginBottom: 28,
    ...shadow.card,
  },
  emailLabel: {
    ...typography.caption1,
    color: colors.gray[600],
    marginBottom: 6,
  },
  emailValue: {
    ...typography.body1,
    color: colors.primary[400],
  },
  sectionTitle: {
    ...typography.body1,
    color: colors.gray[800],
    marginBottom: 12,
  },
  topicList: {
    gap: 8,
    marginBottom: 28,
  },
  topicRow: {
    flexDirection: "row",
    gap: 6,
  },
  topicBullet: {
    ...typography.body4,
    color: colors.gray[600],
  },
  topicText: {
    ...typography.body4,
    color: colors.gray[700],
    flex: 1,
    lineHeight: 20,
  },
  footnote: {
    ...typography.caption2,
    color: colors.gray[600],
    lineHeight: 19,
  },
  footnoteLink: {
    color: colors.primary[400],
    textDecorationLine: "underline",
  },
});
