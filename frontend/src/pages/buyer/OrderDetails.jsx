import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatusBadge from "../../components/buyer/StatusBadge";
import RazorpayButton from "../../components/payment/RazorpayButton";

export default function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  // Replace with buyerService.getOrderById(orderId)
  const order = {
    id: orderId,
    pickup: "Chennai",
    destination: "Coimbatore",
    sender: "ABC Electronics",
    receiver: "Ramesh Kumar",
    receiverPhone: "+91 9876543210",
    vehicle: "Mini Truck",
    weight: "650 KG",
    category: "Electronics",
    bookedOn: "20 July 2026",
    pickupDate: "21 July 2026",
    deliveryDate: "22 July 2026",
    amount: 850,
    payment: "Paid",
    status: "Driver Assigned",
    driver: {
      name: "Arun Kumar",
      phone: "+91 9876501234",
      rating: 4.9,
      vehicleNo: "TN09AB4587",
    },
  };

  return (
    <DashboardLayout
      title="Shipment Details"
      subtitle={`Order ID : ${order.id}`}
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Shipment Status */}

        <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">

          <h2 className="text-lg font-semibold text-primary">
            Shipment Status
          </h2>

          <div className="mt-6 grid md:grid-cols-4 gap-4">

            {[
              "Order Placed",
              "Driver Assigned",
              "In Transit",
              "Delivered",
            ].map((step) => (

              <div
                key={step}
                className="rounded-lg border border-primary/10 p-4 text-center"
              >
                <StatusBadge status={step} />
              </div>

            ))}

          </div>

        </div>

        {/* Information */}

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Shipment */}

          <div className="bg-white rounded-xl border border-primary/10 p-6">

            <h3 className="font-semibold text-primary text-lg">
              Shipment Information
            </h3>

            <div className="mt-6 space-y-4">

              <div className="flex justify-between">
                <span>Pickup</span>
                <strong>{order.pickup}</strong>
              </div>

              <div className="flex justify-between">
                <span>Destination</span>
                <strong>{order.destination}</strong>
              </div>

              <div className="flex justify-between">
                <span>Goods</span>
                <strong>{order.category}</strong>
              </div>

              <div className="flex justify-between">
                <span>Weight</span>
                <strong>{order.weight}</strong>
              </div>

              <div className="flex justify-between">
                <span>Vehicle</span>
                <strong>{order.vehicle}</strong>
              </div>

              <div className="flex justify-between">
                <span>Booked On</span>
                <strong>{order.bookedOn}</strong>
              </div>

              <div className="flex justify-between">
                <span>Pickup Date</span>
                <strong>{order.pickupDate}</strong>
              </div>

              <div className="flex justify-between">
                <span>Delivery Date</span>
                <strong>{order.deliveryDate}</strong>
              </div>

            </div>

          </div>

          {/* Driver */}

          <div className="bg-white rounded-xl border border-primary/10 p-6">

            <h3 className="font-semibold text-primary text-lg">
              Driver Information
            </h3>

            <div className="mt-6 space-y-4">

              <div className="flex justify-between">
                <span>Name</span>
                <strong>{order.driver.name}</strong>
              </div>

              <div className="flex justify-between">
                <span>Phone</span>
                <strong>{order.driver.phone}</strong>
              </div>

              <div className="flex justify-between">
                <span>Vehicle Number</span>
                <strong>{order.driver.vehicleNo}</strong>
              </div>

              <div className="flex justify-between">
                <span>Rating</span>
                <strong>{order.driver.rating}</strong>
              </div>

            </div>

          </div>

        </div>

        {/* Payment */}

        <div className="bg-white rounded-xl border border-primary/10 p-6">

          <h3 className="text-lg font-semibold text-primary">
            Payment Summary
          </h3>

          <div className="mt-6 flex justify-between">

            <span>Total Amount</span>

            <strong className="text-xl">
              ₹{order.amount}
            </strong>

          </div>

          <div className="mt-4 flex items-center justify-between">

              <span className="font-medium">
                Payment Status
              </span>

              <StatusBadge status={order.payment} />

            </div>

        </div>

        {order.payment.status !== "Paid" && (

            <RazorpayButton

            orderId={order._id}

            amount={order.pricing.totalAmount}

            onSuccess={() => {

              alert("Payment Successful");

              window.location.reload();

              }}

            />

            )}

        {/* Actions */}

        <div className="flex flex-wrap gap-4">

          <button
            onClick={() => navigate(`/buyer/orders/${order.id}/track`)}
            className="rounded-lg bg-primary px-6 py-3 text-white hover:opacity-90"
          >
            Track Shipment
          </button>

          <a
            href={`${import.meta.env.VITE_API_URL}${order.payment.invoiceUrl}`}
            target="_blank"
            rel="noreferrer"
            className="border border-primary rounded-lg px-6 py-3"
          >
            Download Invoice
          </a>

          {order.status !== "Delivered" && (
            <button
              onClick={() => {
                const confirmed = window.confirm(
                  "Are you sure you want to cancel this shipment?"
                );

                if (confirmed) {
                  // TODO:
                  // await buyerService.cancelOrder(order.id);
                  alert("Shipment cancelled successfully.");
                }
              }}
              className="rounded-lg border border-danger/20 px-6 py-3 text-danger hover:bg-danger/5"
            >
              Cancel Shipment
            </button>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}