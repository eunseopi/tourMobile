import { ScreenStateView } from "src/components/ui/ScreenStateView";

type Props = {
  type: "loading" | "error";
  onRetry?: () => void;
};

export function ProfileEditStateView({ type, onRetry }: Props) {
  return (
    <ScreenStateView
      type={type}
      title="프로필 수정"
      loadingText="프로필 정보를 불러오는 중..."
      errorText="프로필 정보를 불러오지 못했어요."
      onRetry={onRetry}
    />
  );
}
