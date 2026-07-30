import Logo from "src/assets/Logo.svg";

type Props = {
  size?: number;
};

export function HallabongLogo({ size = 160 }: Props) {
  return <Logo width={size} height={size} />;
}
