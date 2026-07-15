import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatusBadge from "../../components/buyer/StatusBadge";
import { printInvoice } from "../../utils/printInvoice";
const paymentData = [
  {
    id: "TXN983452",
    orderId: "CGZ-100125",
    amount: 850,
    method: "UPI",
    status: "Success",
    date: "20 Jul 2026",
  },
  {
    id: "TXN983453",
    orderId: "CGZ-100126",
    amount: 620,
    method: "Credit Card",
    status: "Pending",
    date: "19 Jul 2026",
  },
  {
    id: "TXN983454",
    orderId: "CGZ-100127",
    amount: 3400,
    method: "Net Banking",
    status: "Success",
    date: "18 Jul 2026",
  },
];

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Later:
    // buyerService.getPaymentHistory()
    setPayments(paymentData);
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter(
      (payment) =>
        payment.id.toLowerCase().includes(search.toLowerCase()) ||
        payment.orderId.toLowerCase().includes(search.toLowerCase())
    );
  }, [payments, search]);

  const downloadReceipt = (payment) => {
    const opened = printInvoice({
      heading: "CargoZent Payment Receipt",
      subheading: `Transaction ${payment.id}`,
      rows: [
        ["Transaction ID", payment.id],
        ["Order ID", payment.orderId],
        ["Payment Method", payment.method],
        ["Amount", `₹${payment.amount}`],
        ["Status", payment.status],
        ["Date", payment.date],
      ],
      footer: "Thank you for shipping with CargoZent.",
    });

    if (!opened) {
      alert(
        "Please allow pop-ups for this site to download the invoice."
      );
    }
  };

  return (
    <DashboardLayout
      title="Payment History"
      subtitle="View all payment transactions."
    >
      <div className="space-y-6">

        <input
          type="text"
          placeholder="Search Transaction ID or Order ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full lg:w-96 rounded-lg border border-primary/10 px-4 py-3"
        />

        <div className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">

          <table className="w-full">

            <thead className="bg-secondary/20">

              <tr className="text-left">

                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Action</th>

              </tr>

            </thead>

            <tbody>

              {filteredPayments.map((payment) => (

                <tr
                  key={payment.id}
                  className="border-t border-primary/10"
                >
                  <td className="px-6 py-4 font-medium">
                    {payment.id}
                  </td>

                  <td className="px-6 py-4">
                    {payment.orderId}
                  </td>

                  <td className="px-6 py-4">
                    {payment.method}
                  </td>

                  <td className="px-6 py-4">
                    ₹{payment.amount}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={payment.status} />
                  </td>

                  <td className="px-6 py-4">
                    {payment.date}
                  </td>

                  <td className="px-6 py-4">

                    <button
                      onClick={() => downloadReceipt(payment)}
                      className="rounded-md border border-primary/20 px-4 py-2 text-primary hover:bg-primary/5"
                    >
                      Invoice
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {filteredPayments.length === 0 && (
            <div className="p-10 text-center text-[#5B7A70]">
              No payment records found.
            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}