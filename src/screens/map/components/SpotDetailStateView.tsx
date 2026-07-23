import { ScreenStateView } from "src/components/ui/ScreenStateView";

type Props = {
  type: "loading" | "error";
  onRetry?: () => void;
};

export function SpotDetailStateView({ type, onRetry }: Props) {
  return (
    <ScreenStateView
      type={type}
      loadingText="스팟 정보를 불러오는 중..."
      errorText="스팟 정보를 찾을 수 없어요."
      onRetry={onRetry}
    />
  );
}
