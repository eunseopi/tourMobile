import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { ScreenHeader } from "src/components/navigation/ScreenHeader";
import { commonStyles } from "src/design/commonStyles";
import { colors, layout, typography } from "src/design/theme";

const AUDIENCE = [
  "제주 여행 중 놓치기 아쉬운 스팟을 놀이처럼 방문하고 싶은 여행자",
  "나만의 제주 여행 기록을 사진과 함께 남기고 공유하고 싶은 사람",
  "여행 중 소소한 리워드(한라봉)를 모아 혜택으로 바꾸고 싶은 사람",
];

const FEATURES: { title: string; desc: string }[] = [
  {
    title: "챌린지",
    desc: "관심 테마(데이트, 힐링, 자연, 맛집 탐방 등)에 맞춘 미션을 확인하고, 스팟 방문·사진 인증으로 챌린지를 완료합니다.",
  },
  {
    title: "지도",
    desc: "주변 스팟과 게시물, 진행 중인 챌린지를 지도에서 한눈에 탐색합니다.",
  },
  {
    title: "커뮤니티",
    desc: "방문한 스팟과 여행 기록을 게시물로 남기고, 다른 여행자와 좋아요·댓글로 소통합니다.",
  },
  {
    title: "한라봉 리워드",
    desc: "챌린지 완료로 적립한 한라봉을 스토어에서 쿠폰·상품으로 교환합니다.",
  },
];

type Props = NativeStackScreenProps<RootStackParamList, "About">;

export default function AboutScreen({ navigation }: Props) {
  return (
    <View style={commonStyles.screen}>
      <ScreenHeader title="서비스 소개" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>하루제주</Text>
        <Text style={styles.tagline}>제주를 걸으며 완성하는 나만의 하루 챌린지</Text>

        <Text style={styles.sectionTitle}>어떤 서비스인가요</Text>
        <Text style={styles.paragraph}>
          하루제주는 제주 곳곳의 명소·맛집·자연 스팟을 직접 방문하고 인증하며 챌린지를 완료하는
          여행 동반 서비스입니다. 완료한 챌린지는 한라봉(포인트)으로 적립되고, 스토어에서 쿠폰과
          상품으로 교환할 수 있습니다.
        </Text>

        <Text style={styles.sectionTitle}>누구를 위한 서비스인가요</Text>
        <View style={styles.list}>
          {AUDIENCE.map((item) => (
            <View key={item} style={styles.listRow}>
              <Text style={styles.listBullet}>{"•"}</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>핵심 기능</Text>
        <View style={styles.list}>
          {FEATURES.map((feature) => (
            <Text key={feature.title} style={styles.listText}>
              <Text style={styles.featureTitle}>{feature.title}</Text> — {feature.desc}
            </Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>콘텐츠 안전 기준</Text>
        <Text style={styles.paragraph}>
          커뮤니티에 게시되는 사진과 글은 특정인의 사생활을 침해하거나 명예를 훼손하는 내용,
          상업적 스팸을 금지합니다. 자세한 기준은{" "}
          <Text style={styles.link} onPress={() => navigation.navigate("Terms")}>
            이용약관
          </Text>
          을 참고해주세요.
        </Text>

        <Text style={styles.sectionTitle}>문의</Text>
        <Text style={styles.paragraph}>
          서비스에 대해 궁금한 점이나 제안하고 싶은 내용이 있다면{" "}
          <Text style={styles.link} onPress={() => navigation.navigate("Contact")}>
            문의하기
          </Text>{" "}
          페이지를 이용해주세요.
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
  heading: {
    ...typography.head2,
    color: colors.gray[800],
    marginBottom: 6,
  },
  tagline: {
    ...typography.body3,
    color: colors.gray[600],
    marginBottom: 28,
  },
  sectionTitle: {
    ...typography.body1,
    color: colors.gray[800],
    marginTop: 22,
    marginBottom: 10,
  },
  paragraph: {
    ...typography.body4,
    color: colors.gray[700],
    lineHeight: 22,
  },
  list: {
    gap: 10,
  },
  listRow: {
    flexDirection: "row",
    gap: 6,
  },
  listBullet: {
    ...typography.body4,
    color: colors.gray[600],
  },
  listText: {
    ...typography.body4,
    color: colors.gray[700],
    flex: 1,
    lineHeight: 21,
  },
  featureTitle: {
    ...typography.body3,
    color: colors.gray[800],
  },
  link: {
    color: colors.primary[400],
    textDecorationLine: "underline",
  },
});
