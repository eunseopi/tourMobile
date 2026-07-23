import { ScreenStateView } from "src/components/ui/ScreenStateView";
import { colors } from "src/design/theme";

type Props = {
  type: "loading" | "error";
  onRetry?: () => void;
};

export function ProductDetailStateView({ type, onRetry }: Props) {
  return (
    <ScreenStateView
      type={type}
      loadingText="상품 정보를 불러오는 중..."
      errorText="상품 정보를 찾을 수 없어요."
      backgroundColor={colors.bg[50]}
      onRetry={onRetry}
    />
  );
}
