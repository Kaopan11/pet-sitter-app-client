import Icon from "@/components/Icon";
import { formatPayoutCurrency } from "@/lib/payoutFormat";

/** การ์ดยอดรวม — totalEarning จาก BE เท่านั้น (Figma: label ซ้าย · ตัวเลขขวา) */
export default function TotalEarningCard({ totalEarning = 0 }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-6 rounded-2xl bg-white px-8 py-6">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
        <Icon src="/icon/baht.svg" className="h-6 w-6" />
      </span>

      {/* แถวกลาง: ชื่อการ์ด vs ยอดเงิน กระจายซ้าย–ขวาตาม Figma */}
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <p className="text-body-2 text-gray-500">Total Earning</p>
        <p className="shrink-0 text-h4 font-bold text-gray-900">
          {formatPayoutCurrency(totalEarning)}
        </p>
      </div>
    </div>
  );
}
