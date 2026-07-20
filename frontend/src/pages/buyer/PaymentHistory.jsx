import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import TruckLoader from "../../components/common/TruckLoader";
import orderService from "../../services/orderService";
import { printInvoice } from "../../utils/printInvoice";

const METHOD_LABELS = {
  cod: "Cash on Delivery",
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
};

// Local status style mapping configuration (High contrast, pure white text)
const statusConfig = {
  Pending: { bg: "#FF9100", text: "#FFFFFF", shadow: "rgba(255, 145, 0, 0.25)" },
  Paid: { bg: "#00E676", text: "#FFFFFF", shadow: "rgba(0, 230, 118, 0.25)" },
  Cancelled: { bg: "#FF3D00", text: "#FFFFFF", shadow: "rgba(255, 61, 0, 0.25)" },
  Failed: { bg: "#FF3D00", text: "#FFFFFF", shadow: "rgba(255, 61, 0, 0.25)" },
  Success: { bg: "#00E676", text: "#FFFFFF", shadow: "rgba(0, 230, 118, 0.25)" },
};

// Turns a raw order into a payment/transaction row. Every order the buyer
// has placed has an implicit "transaction" — for product orders that's
// productPaymentStatus/productPaymentMethod, for shipment (freight) orders
// it's the payment sub-document set by the Razorpay flow.
const toPaymentRow = (order) => {
  const isProduct = order.orderType === "product";
  const amount = isProduct ? order.productTotal : order.pricing?.totalAmount || 0;
  const isCancelled = isProduct ? order.status === "cancelled" : order.tracking?.currentStatus === "Cancelled";

  let status = "Pending";
  if (isCancelled) status = "Cancelled";
  else if (isProduct && order.productPaymentStatus === "paid") status = "Paid";
  else if (!isProduct && order.payment?.status === "paid") status = "Paid";

  const method = isProduct
    ? METHOD_LABELS[order.productPaymentMethod] || "—"
    : order.payment?.razorpayPaymentId
    ? "Razorpay"
    : "—";

  return {
    id: order.payment?.transactionId || order.payment?.razorpayPaymentId || order._id,
    orderId: order.orderId,
    amount,
    method,
    status,
    date: new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  };
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    orderService
      .getMyOrders()
      .then(({ orders }) => {
        setPayments((orders || []).map(toPaymentRow));
        setError("");
      })
      .catch(() => setError("Could not load your payment history."))
      .finally(() => setLoading(false));
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
      alert("Please allow pop-ups for this site to download the invoice.");
    }
  };

  return (
    <DashboardLayout
      title="Payment History"
      subtitle="View all payment transactions."
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        <input
          type="text"
          placeholder="Search Transaction ID or Order ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full lg:w-96 rounded-lg border border-primary/10 bg-secondary/20 px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none text-primary placeholder-primary/40"
        />

        {loading ? (
          <TruckLoader fullScreen={false} />
        ) : error ? (
          <div className="rounded-xl border border-danger/20 bg-secondary/20 p-10 text-center text-danger">
            {error}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-primary/10 bg-secondary/20 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-primary/10 text-xs font-bold uppercase tracking-wider text-[#8AA399]">
                  <tr>
                    <th className="px-6 py-4">Transaction</th>
                    <th className="px-6 py-4">Order</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-primary/10 font-medium text-primary">
                  {filteredPayments.map((payment) => {
                    const styleConfig = statusConfig[payment.status] || {
                      bg: "#4B5563",
                      text: "#FFFFFF",
                      shadow: "rgba(0, 0, 0, 0.1)",
                    };

                    return (
                      <tr key={payment.id} className="transition hover:bg-primary/5">
                        <td className="whitespace-nowrap px-6 py-4 font-bold">{payment.id}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#8AA399]">{payment.orderId}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#8AA399]">{payment.method}</td>
                        <td className="whitespace-nowrap px-6 py-4 font-bold">₹{payment.amount}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <span
                            className="inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-extrabold uppercase tracking-wider min-w-[90px] text-center select-none"
                            style={{
                              backgroundColor: styleConfig.bg,
                              color: styleConfig.text,
                              boxShadow: `0 4px 10px ${styleConfig.shadow}`,
                            }}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#8AA399]">{payment.date}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <button
                            onClick={() => downloadReceipt(payment)}
                            className="rounded-lg border border-[#00E676]/30 bg-[#00E676]/5 px-4 py-1.5 text-xs font-bold text-[#00E676] transition-all duration-200 hover:bg-[#00E676]/10 hover:border-[#00E676]"
                          >
                            Invoice
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredPayments.length === 0 && (
              <div className="p-10 text-center text-[#8AA399] font-medium">
                No payment records found.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}