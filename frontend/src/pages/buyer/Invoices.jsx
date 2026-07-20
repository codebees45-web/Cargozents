import { useEffect, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import TruckLoader from "../../components/common/TruckLoader";
import orderService from "../../services/orderService";
import { printInvoice } from "../../utils/printInvoice";

// Turns a raw order (product or shipment) into the shape this page renders.
// Mirrors the same product/shipment branching used on BuyerDashboard and
// OrderDetails so the numbers shown here always match what the buyer sees
// elsewhere.
const toInvoiceRow = (order) => {
  const isProduct = order.orderType === "product";

  const amount = isProduct ? order.productTotal : order.pricing?.totalAmount || 0;
  const isPaid = isProduct
    ? order.productPaymentStatus === "paid"
    : order.payment?.status === "paid";

  return {
    id: order._id,
    invoiceNo: order.payment?.invoiceNumber || order.orderId,
    orderId: order.orderId,
    amount,
    date: new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    status: isPaid ? "Paid" : "Pending",
    // kept for the printable receipt below
    pickup: order.pickup?.address,
    delivery: order.delivery?.address,
    itemsLabel: isProduct
      ? (order.items || []).map((i) => `${i.product?.name || "Item"} x${i.quantity}`).join(", ")
      : order.goods?.name,
  };
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    orderService
      .getMyOrders()
      .then(({ orders }) => {
        setInvoices((orders || []).map(toInvoiceRow));
        setError("");
      })
      .catch(() => setError("Could not load your invoices."))
      .finally(() => setLoading(false));
  }, []);

  const downloadInvoice = (invoice) => {
    const opened = printInvoice({
      heading: "CargoZent Invoice",
      subheading: `Invoice ${invoice.invoiceNo}`,
      rows: [
        ["Invoice No", invoice.invoiceNo],
        ["Order ID", invoice.orderId],
        ...(invoice.pickup ? [["Pickup", invoice.pickup]] : []),
        ...(invoice.delivery ? [["Delivery", invoice.delivery]] : []),
        ...(invoice.itemsLabel ? [["Items", invoice.itemsLabel]] : []),
        ["Amount", `₹${invoice.amount}`],
        ["Date", invoice.date],
        ["Status", invoice.status],
      ],
      footer: "Thank you for shipping with CargoZent.",
    });

    if (!opened) {
      alert("Please allow pop-ups for this site to download the invoice.");
    }
  };

  return (
    <DashboardLayout
      title="Invoices"
      subtitle="Download invoices for completed shipments."
    >
      {loading ? (
        <TruckLoader fullScreen={false} />
      ) : error ? (
        <div className="rounded-xl border border-danger/20 bg-white p-12 text-center text-danger">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-primary/10 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/20">
              <tr>
                <th className="text-left px-6 py-4">Invoice No</th>
                <th className="text-left px-6 py-4">Order ID</th>
                <th className="text-left px-6 py-4">Amount</th>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t border-primary/10">
                  <td className="px-6 py-4">{invoice.invoiceNo}</td>
                  <td className="px-6 py-4">{invoice.orderId}</td>
                  <td className="px-6 py-4">₹{invoice.amount}</td>
                  <td className="px-6 py-4">{invoice.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-md px-3 py-1 text-sm ${
                        invoice.status === "Paid"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => downloadInvoice(invoice)}
                      className="rounded-lg border border-primary/20 px-4 py-2 text-primary hover:bg-primary/5"
                    >
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {invoices.length === 0 && (
            <div className="p-12 text-center text-[#5B7A70]">
              You don't have any orders yet.
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}