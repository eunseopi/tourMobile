import { ScreenStateView } from "src/components/ui/ScreenStateView";

type Props = {
  type: "loading" | "error";
  onRetry?: () => void;
};

export function PostDetailStateView({ type, onRetry }: Props) {
  return (
    <ScreenStateView
      type={type}
      title="게시글"
      loadingText="게시글을 불러오는 중..."
      errorText="게시글을 찾을 수 없어요."
      onRetry={onRetry}
    />
  );
}
