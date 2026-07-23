import { PrimaryActionButton } from "src/components/ui/PrimaryActionButton";

type Props = {
  isSaving: boolean;
  disabled: boolean;
  onSave: () => void;
};

export function ProfileEditSubmitBar({ isSaving, disabled, onSave }: Props) {
  return (
    <PrimaryActionButton label="수정하기" isLoading={isSaving} disabled={disabled} onPress={onSave} />
  );
}
