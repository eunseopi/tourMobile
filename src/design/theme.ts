export const colors = {
  primary: {
    50: "#FFF9ED",
    100: "#FFECC8",
    200: "#FFD689",
    300: "#FACA70",
    400: "#FF8B4C",
    500: "#E66620",
    600: "#DB6323",
  },
  gray: {
    100: "#F5F5F5",
    200: "#F0F0F0",
    300: "#D9D9D9",
    400: "#B7B7B7",
    500: "#818181",
    600: "#565252",
    700: "#383737",
    800: "#221F1F",
  },
  bg: {
    0: "#FFFFFF",
    50: "#F8F8F8",
  },
  base: {
    0: "#FFFFFF",
    100: "#000000",
  },
  error: {
    100: "#FF4646",
    200: "#C72222",
  },
} as const;

export const typography = {
  head1: { fontSize: 32, lineHeight: 45, fontWeight: "700" as const },
  head2: { fontSize: 24, lineHeight: 34, fontWeight: "600" as const },
  head3: { fontSize: 20, lineHeight: 28, fontWeight: "600" as const },
  head4: { fontSize: 18, lineHeight: 25, fontWeight: "700" as const },
  body1: { fontSize: 16, lineHeight: 22, fontWeight: "500" as const },
  body2: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
  body3: { fontSize: 14, lineHeight: 20, fontWeight: "500" as const },
  body4: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  caption1: { fontSize: 13, lineHeight: 18, fontWeight: "500" as const },
  caption2: { fontSize: 13, lineHeight: 18, fontWeight: "400" as const },
} as const;

export const layout = {
  screenPadding: 20,
  buttonRadius: 10,
  buttonHeight: 48,
  headerPaddingHorizontal: 14,
  headerPaddingVertical: 10,
  bottomActionPaddingBottom: 46,
} as const;

// 카드/섹션 간 여백을 통일하기 위한 스케일. 전체적으로 여백이 너무 넓다는 피드백으로
// 처음 값(4/8/12/16/20/24/32)에서 절반으로 줄였다.
export const spacing = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 10,
  xxl: 12,
  xxxl: 16,
  cardPadding: 8,
  cardGap: 8,
  sectionGap: 12,
} as const;

export const shadow = {
  card: {
    shadowColor: "#D2D2D2",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
} as const;
