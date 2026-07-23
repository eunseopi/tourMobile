import { PrimaryActionButton } from "src/components/ui/PrimaryActionButton";

type Props = {
  isPurchasing: boolean;
  onPurchase: () => void;
};

export function ProductPurchaseButton({ isPurchasing, onPurchase }: Props) {
  return (
    <PrimaryActionButton label="구매하기" isLoading={isPurchasing} onPress={onPurchase} />
  );
}
