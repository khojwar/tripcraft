"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ lat, lon }) {
  const latNum = typeof lat === "string" ? parseFloat(lat) : lat;
  const lonNum = typeof lon === "string" ? parseFloat(lon) : lon;

  const validCoords = Number.isFinite(latNum) && Number.isFinite(lonNum);

  if (!validCoords) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 text-sm text-gray-600">
        Map unavailable — missing coordinates
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <MapContainer
        key={`${latNum}-${lonNum}`}
        center={[latNum, lonNum]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        <Marker position={[latNum, lonNum]}>
          <Popup>You are here!</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
