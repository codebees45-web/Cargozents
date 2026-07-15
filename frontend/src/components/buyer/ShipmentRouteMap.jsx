import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";
import useTracking from "../../hooks/useTracking";

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "14px",
};

export default function ShipmentRouteMap({
  pickup,
  delivery,
  orderId,
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey:
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [directions, setDirections] =
    useState(null);

  const driverLocation = useTracking(orderId);

  useEffect(() => {
    if (
      !isLoaded ||
      !pickup ||
      !delivery
    )
      return;

    const service =
      new window.google.maps.DirectionsService();

    service.route(
      {
        origin: pickup,
        destination: delivery,
        travelMode:
          window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
        }
      }
    );
  }, [isLoaded, pickup, delivery]);

  if (!isLoaded)
    return (
      <div className="h-[400px] rounded-xl border border-primary/10 flex items-center justify-center">
        Loading Google Maps...
      </div>
    );

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      zoom={7}
      center={pickup}
    >
      <Marker position={pickup} />

      <Marker position={delivery} />

      {driverLocation && (
        <Marker
          position={driverLocation}
          icon={{
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: "#2563eb",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          }}
        />
      )}

      {directions && (
        <DirectionsRenderer
          directions={directions}
        />
      )}
    </GoogleMap>
  );
}