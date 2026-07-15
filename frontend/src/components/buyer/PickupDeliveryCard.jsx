import { ArrowLeftRight, Navigation } from "lucide-react";
import GoogleAddressInput from "../common/GoogleAddressInput";

export default function PickupDeliveryCard({
  formData,
  swapLocations,
  onPickupSelect,
  onDeliverySelect,
  distance,
  duration,
  loadingDistance,
}) {
  return (
    <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">

      <h2 className="text-xl font-semibold text-primary mb-6">
        Pickup & Delivery
      </h2>

      <div className="space-y-6">

        {/* Pickup */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Pickup Address
          </label>

          <GoogleAddressInput
            label=""
            value={formData.pickupAddress}
            placeholder="Search pickup location"
            onAddressSelect={onPickupSelect}
          />

          <button
            type="button"
            className="mt-3 flex items-center gap-2 text-primary text-sm"
          >
            <Navigation size={16} />
            Use Current Location
          </button>

        </div>

        {/* Swap */}

        <div className="flex justify-center">

          <button
            type="button"
            onClick={swapLocations}
            className="rounded-full border border-primary/10 p-3 hover:bg-primary/5 transition"
          >
            <ArrowLeftRight size={20} />
          </button>

        </div>

        {/* Delivery */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Delivery Address
          </label>

          <GoogleAddressInput
            label=""
            value={formData.deliveryAddress}
            placeholder="Search delivery location"
            onAddressSelect={onDeliverySelect}
          />

        </div>

        {/* Distance */}

        <div className="rounded-lg bg-background border border-primary/10 p-4">

          <div className="flex justify-between">

            <span className="text-[#5B7A70]">
              Estimated Distance
            </span>

            <strong>
              {loadingDistance
                ? "Calculating..."
                : distance
                ? `${distance.toFixed(1)} KM`
                : "-- KM"}
            </strong>

          </div>

          <div className="mt-3 flex justify-between">

            <span className="text-[#5B7A70]">
              Estimated Travel Time
            </span>

            <strong>
              {loadingDistance
                ? "Calculating..."
                : duration || "--"}
            </strong>

          </div>

        </div>

      </div>

    </div>
  );
}