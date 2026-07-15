import { useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";

const initialAddresses = [
  {
    id: 1,
    label: "Home",
    name: "Nagaraj K",
    phone: "9876543210",
    address:
      "12, Gandhi Street, Tambaram, Chennai, Tamil Nadu - 600045",
    default: true,
  },
  {
    id: 2,
    label: "Office",
    name: "Nagaraj K",
    phone: "9876543210",
    address:
      "CIT Campus, Kundrathur Road, Chennai, Tamil Nadu",
    default: false,
  },
];

export default function SavedAddresses() {
  const [addresses, setAddresses] = useState(initialAddresses);

  const setDefault = (id) => {
    setAddresses((prev) =>
      prev.map((item) => ({
        ...item,
        default: item.id === id,
      }))
    );
  };

  const deleteAddress = (id) => {
    setAddresses((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <DashboardLayout
      title="Saved Addresses"
      subtitle="Manage pickup and delivery addresses."
    >
      <div className="space-y-6">

        <div className="flex justify-end">

          <button className="rounded-lg bg-primary px-5 py-3 text-white">
            Add Address
          </button>

        </div>

        {addresses.map((address) => (

          <div
            key={address.id}
            className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm"
          >

            <div className="flex justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <h2 className="font-semibold text-lg text-primary">
                    {address.label}
                  </h2>

                  {address.default && (
                    <span className="rounded bg-success/10 px-3 py-1 text-xs text-success">
                      Default
                    </span>
                  )}

                </div>

                <p className="mt-3 font-medium">
                  {address.name}
                </p>

                <p className="text-[#5B7A70]">
                  {address.phone}
                </p>

                <p className="mt-2 text-[#5B7A70]">
                  {address.address}
                </p>

              </div>

              <div className="flex gap-3">

                {!address.default && (
                  <button
                    onClick={() => setDefault(address.id)}
                    className="rounded-lg border border-primary/20 px-4 py-2 text-primary"
                  >
                    Set Default
                  </button>
                )}

                <button
                  className="rounded-lg border border-primary/20 px-4 py-2 text-primary"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteAddress(address.id)}
                  className="rounded-lg border border-danger/20 px-4 py-2 text-danger"
                >
                  Delete
                </button>

              </div>

            </div>

          </div>

        ))}

        {addresses.length === 0 && (

          <div className="rounded-xl border border-primary/10 bg-white p-12 text-center">

            <h2 className="text-xl font-semibold text-primary">
              No Saved Addresses
            </h2>

            <p className="mt-2 text-[#5B7A70]">
              Add your first address to make booking shipments faster.
            </p>

          </div>

        )}

      </div>
    </DashboardLayout>
  );
}