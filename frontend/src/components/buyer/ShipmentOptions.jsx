import { Calendar, ShieldCheck, TicketPercent } from "lucide-react";

export default function ShipmentOptions({
  formData,
  handleChange,
}) {
  return (
    <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">

      <h2 className="text-xl font-semibold text-primary">
        Shipment Options
      </h2>

      <p className="mt-1 text-sm text-[#5B7A70]">
        Configure delivery preferences.
      </p>

      <div className="mt-8 space-y-8">

        {/* Delivery Type */}

        <div>

          <label className="block mb-3 font-medium">
            Delivery Type
          </label>

          <div className="grid md:grid-cols-3 gap-4">

            {[
              "Standard",
              "Express",
              "Same Day",
            ].map((type) => (

              <label
                key={type}
                className={`cursor-pointer rounded-lg border p-4 transition ${
                  formData.deliveryType === type
                    ? "border-primary bg-primary/5"
                    : "border-primary/10"
                }`}
              >

                <input
                  hidden
                  type="radio"
                  name="deliveryType"
                  value={type}
                  checked={
                    formData.deliveryType === type
                  }
                  onChange={handleChange}
                />

                <h4 className="font-semibold">
                  {type}
                </h4>

              </label>

            ))}

          </div>

        </div>

        {/* Schedule */}

        <div>

          <label className="mb-3 flex items-center gap-2 font-medium">

            <Calendar size={18} />

            Pickup Schedule

          </label>

          <input
            type="datetime-local"
            name="pickupSchedule"
            value={formData.pickupSchedule}
            onChange={handleChange}
            className="w-full rounded-lg border border-primary/10 px-4 py-3"
          />

        </div>

        {/* Insurance */}

        <div>

          <label className="mb-3 flex items-center gap-2 font-medium">

            <ShieldCheck size={18} />

            Insurance

          </label>

          <select
            name="insurance"
            value={formData.insurance}
            onChange={handleChange}
            className="w-full rounded-lg border border-primary/10 px-4 py-3"
          >

            <option value="None">
              No Insurance
            </option>

            <option value="Standard">
              Standard
            </option>

            <option value="Premium">
              Premium
            </option>

          </select>

        </div>

        {/* Coupon */}

        <div>

          <label className="mb-3 flex items-center gap-2 font-medium">

            <TicketPercent size={18} />

            Coupon Code

          </label>

          <div className="flex gap-3">

            <input
              type="text"
              placeholder="Enter coupon"
              name="coupon"
              value={formData.coupon}
              onChange={handleChange}
              className="flex-1 rounded-lg border border-primary/10 px-4 py-3"
            />

            <button
              className="rounded-lg bg-primary px-6 text-white"
            >
              Apply
            </button>

          </div>

        </div>

        {/* Notes */}

        <div>

          <label className="block mb-3 font-medium">
            Special Instructions
          </label>

          <textarea
            rows="4"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Handling instructions..."
            className="w-full rounded-lg border border-primary/10 px-4 py-3 resize-none"
          />

        </div>

      </div>

    </div>
  );
}