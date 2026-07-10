import Link from "next/link";
import { Plus } from "lucide-react";

interface Props {
  href: string;
  children: React.ReactNode;
  withPlus?: boolean;
  fullWidth?: boolean;
}

// Rausch CTA 버튼 — 높이 48px, 라운드 8px, 눌림 #e00b41
export default function PrimaryButton({
  href,
  children,
  withPlus = true,
  fullWidth = false,
}: Props) {
  return (
    <Link
      href={href}
      className={`inline-flex h-12 items-center justify-center gap-1.5 rounded-(--radius-btn) bg-rausch px-6 text-base font-semibold whitespace-nowrap text-white hover:bg-rausch-press active:bg-rausch-press ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {withPlus && <Plus size={18} strokeWidth={2.5} />}
      {children}
    </Link>
  );
}
