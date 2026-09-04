import Link from "next/link";
import Icon from "@/components/Icon";
import { formatBankDisplay } from "@/lib/payoutFormat";

/**
 * การ์ดบัญชี — กดไปหน้าแก้ไข (T03)
 * Figma: label ซ้าย · ชื่อธนาคารสีส้มขวา · chevron ปลายการ์ด
 */
export default function BankAccountCard({ bankAccount }) {
  const label = formatBankDisplay(bankAccount);

  return (
    <Link
      href="/sitter/payout/bank-account"
      className="flex min-w-0 flex-1 items-center gap-6 rounded-2xl bg-white px-8 py-6 transition-colors hover:bg-orange-50/40"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
        <Icon src="/icon/wallet.svg" className="h-6 w-6" />
      </span>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <p className="text-body-2 text-gray-500">Bank Account</p>
        <p
          className={`truncate text-body-1 font-bold ${
            label ? "text-orange-500" : "text-gray-400"
          }`}
        >
          {label ?? "Add bank account"}
        </p>
      </div>

      <Icon
        src="/icon/chevron-right.svg"
        className="h-5 w-5 shrink-0 text-gray-400"
      />
    </Link>
  );
}
