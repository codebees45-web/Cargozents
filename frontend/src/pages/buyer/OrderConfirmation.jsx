import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";

export default function OrderConfirmation() {
  const navigate = useNavigate();

  const order = {
    orderId: "CGZ-202600124",
    bookingDate: new Date().toLocaleDateString(),
    estimatedPickup: "Today, 04:30 PM",
    estimatedDelivery: "Tomorrow, 02:00 PM",
    paymentStatus: "Paid",
    shipmentStatus: "Awaiting Driver Assignment",
    amount: "₹850",
  };

  return (
    <DashboardLayout
      title="Order Confirmation"
      subtitle="Your shipment request has been successfully submitted."
    >
      <div className="max-w-4xl mx-auto">

        <div className="rounded-xl border border-primary/10 bg-white shadow-sm">

          <div className="border-b border-primary/10 px-8 py-6">

            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-success"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 className="mt-5 text-2xl font-bold text-primary">
              Shipment Created Successfully
            </h2>

            <p className="mt-2 text-[#5B7A70]">
              Your shipment request has been submitted successfully.
              Our system is now searching for the most suitable driver.
            </p>

          </div>

          <div className="p-8">

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <p className="text-xs uppercase text-[#5B7A70]">
                  Order ID
                </p>

                <h3 className="font-semibold text-primary mt-1">
                  {order.orderId}
                </h3>
              </div>

              <div>
                <p className="text-xs uppercase text-[#5B7A70]">
                  Booking Date
                </p>

                <h3 className="font-semibold text-primary mt-1">
                  {order.bookingDate}
                </h3>
              </div>

              <div>
                <p className="text-xs uppercase text-[#5B7A70]">
                  Pickup Time
                </p>

                <h3 className="font-semibold text-primary mt-1">
                  {order.estimatedPickup}
                </h3>
              </div>

              <div>
                <p className="text-xs uppercase text-[#5B7A70]">
                  Expected Delivery
                </p>

                <h3 className="font-semibold text-primary mt-1">
                  {order.estimatedDelivery}
                </h3>
              </div>

              <div>
                <p className="text-xs uppercase text-[#5B7A70]">
                  Payment Status
                </p>

                <span className="inline-flex mt-2 rounded-md bg-success/10 px-3 py-1 text-success text-sm font-medium">
                  {order.paymentStatus}
                </span>
              </div>

              <div>
                <p className="text-xs uppercase text-[#5B7A70]">
                  Shipment Status
                </p>

                <span className="inline-flex mt-2 rounded-md bg-warning/10 px-3 py-1 text-warning text-sm font-medium">
                  {order.shipmentStatus}
                </span>
              </div>

            </div>

            <div className="mt-8 rounded-lg border border-primary/10 bg-background p-6">

              <div className="flex justify-between">

                <span className="text-[#5B7A70]">
                  Total Paid
                </span>

                <span className="text-2xl font-bold text-primary">
                  {order.amount}
                </span>

              </div>

            </div>

            <div className="mt-8 flex flex-wrap gap-4">

              <button
                onClick={() =>
                  navigate(`/buyer/orders/${order.orderId}/track`)
                }
                className="rounded-lg bg-primary px-6 py-3 text-white transition hover:opacity-90"
              >
                Track Shipment
              </button>

              <button
                onClick={() => navigate("/buyer/orders")}
                className="rounded-lg border border-primary/20 px-6 py-3 text-primary transition hover:bg-primary/5"
              >
                View My Orders
              </button>

              <button
                onClick={() => navigate("/buyer/dashboard")}
                className="rounded-lg border border-primary/20 px-6 py-3 text-primary transition hover:bg-primary/5"
              >
                Back to Dashboard
              </button>

            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}