import { formatDateTime } from '../../lib/utils/date';
import type { StockTransaction } from '../../types/database';

interface StockListProps {
  transactions: StockTransaction[];
  onUpdate: () => void;
}

export function StockList({ transactions }: StockListProps) {
  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sheet #</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Type</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Quantity</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                {formatDateTime(transaction.transaction_date)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                {transaction.sheet_number}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {(transaction.product as any)?.name}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  transaction.type === 'in'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {transaction.type.toUpperCase()}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                {transaction.quantity}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {transaction.notes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}