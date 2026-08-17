import { PrimaryActionButton } from "src/components/ui/PrimaryActionButton";

type Props = {
  label?: string;
  isSubmitting: boolean;
  onSubmit: () => void;
};

export function PostWriteSubmitButton({ label = "등록하기", isSubmitting, onSubmit }: Props) {
  return (
    <PrimaryActionButton label={label} isLoading={isSubmitting} onPress={onSubmit} />
  );
}
