import { PrimaryActionButton } from "src/components/ui/PrimaryActionButton";

type Props = {
  isSubmitting: boolean;
  onSubmit: () => void;
};

export function PostWriteSubmitButton({ isSubmitting, onSubmit }: Props) {
  return (
    <PrimaryActionButton label="등록하기" isLoading={isSubmitting} onPress={onSubmit} />
  );
}
