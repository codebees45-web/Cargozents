import { useEffect, useRef } from "react";

export default function GoogleAddressInput({
  label,
  placeholder,
  value,
  onAddressSelect,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (
      !window.google ||
      !window.google.maps ||
      !window.google.maps.places
    ) {
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        componentRestrictions: {
          country: "in",
        },
        fields: [
          "formatted_address",
          "geometry",
          "name",
        ],
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.geometry) return;

      onAddressSelect({
        address: place.formatted_address,

        latitude: place.geometry.location.lat(),

        longitude: place.geometry.location.lng(),
      });
    });
  }, []);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-primary">
        {label}
      </label>

      <input
        ref={inputRef}
        defaultValue={value}
        placeholder={placeholder}
        className="w-full rounded-lg border border-primary/10 bg-white px-4 py-3 outline-none transition focus:border-primary"
      />
    </div>
  );
}