"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ lat, lon }) {
  return (
    <div className="w-full h-96">
      <MapContainer
        key={`${lat}-${lon}`}
        center={[lat, lon]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        <Marker position={[lat, lon]}>
          <Popup>You are here!</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
