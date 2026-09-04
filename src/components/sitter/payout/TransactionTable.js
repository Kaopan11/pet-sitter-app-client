import { formatPayoutCurrency, formatPayoutDate } from "@/lib/payoutFormat";

/** ตารางรายการจองที่นับเข้า earnings แล้ว — style เดียวกับ sitter booking-list */
export default function TransactionTable({ transactions = [] }) {
  if (!transactions.length) {
    return (
      <div className="rounded-2xl bg-white px-6 py-16 text-center">
        <p className="text-body-2 text-gray-400">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Payout transactions</caption>
        <thead className="bg-black text-white">
          <tr>
            <th className="border-0 px-6 py-4 text-body-3 font-medium">Date</th>
            <th className="border-0 px-6 py-4 text-body-3 font-medium">From</th>
            <th className="border-0 px-6 py-4 text-body-3 font-medium">
              Transaction No.
            </th>
            <th className="border-0 px-6 py-4 text-body-3 font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((row) => (
            <tr
              key={`${row.transactionNo}-${row.bookingId}`}
              className="h-19 border-b border-gray-200 last:border-b-0"
            >
              <td className="px-6 py-5 text-body-2 text-black">
                {formatPayoutDate(row.date)}
              </td>
              <td className="px-6 py-5 text-body-2 text-black">{row.from}</td>
              <td className="px-6 py-5 text-body-2 text-black">
                {row.transactionNo}
              </td>
              <td className="px-6 py-5 text-body-2 font-medium text-green">
                {formatPayoutCurrency(row.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
