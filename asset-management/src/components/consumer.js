import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./styles.css"; // Import your normal CSS file

const ConsumerPage = () => {
  const [currentStop, setCurrentStop] = useState(null);
  const [shipPosition, setShipPosition] = useState({ lat: 22.3193, lng: 114.1694 });
  const [progress, setProgress] = useState(0);

  const startPoint = { lat: 22.3193, lng: 114.1694 }; 
  const endPoint = { lat: 28.6139, lng: 77.2090 };

  const stops = [
    { location: { lat: 3.0431, lng: 101.3847 }, amount: 5000, city: "Port Klang, Malaysia" },
    { location: { lat: 6.9271, lng: 79.8612 }, amount: 10000, city: "Colombo, Sri Lanka" },
    { location: { lat: 18.9686, lng: 72.8322 }, amount: 15000, city: "Mumbai Port, India" },
    { location: { lat: 13.0827, lng: 80.2707 }, amount: 20000, city: "Chennai Port, India" },
  ];

  const totalAmount = stops.reduce((acc, stop) => acc + stop.amount, 0);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < stops.length) {
        setShipPosition(stops[index].location);
        setProgress(((index + 1) / stops.length) * 100);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <h1>Consumer Maritime Transport Tracking</h1>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}>
          {Math.round(progress)}% Completed
        </div>
      </div>

      <div className="content">
        {/* Map Section */}
        <div className="map-container">
          <MapContainer center={startPoint} zoom={4} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <Marker position={startPoint}>
              <Popup>Start: Hong Kong Port</Popup>
            </Marker>
            <Marker position={endPoint}>
              <Popup>End: New Delhi (Inland)</Popup>
            </Marker>

            <Marker position={shipPosition}>
              <Popup>Current Ship Position</Popup>
            </Marker>

            <Polyline
              positions={[
                [startPoint.lat, startPoint.lng],
                ...stops.map((stop) => [stop.location.lat, stop.location.lng]),
              ]}
              color="blue"
            />

            {stops.map((stop, index) => (
              <Marker 
                position={stop.location} 
                key={index}
                eventHandlers={{ click: () => setCurrentStop(stop) }}
              >
                <Popup>{stop.city} - Amount Added: ${stop.amount.toLocaleString()}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar Details */}
        <div className="details-container">
          <h2>Shipment Details</h2>
          <p>Total Transported Amount: <strong>${totalAmount.toLocaleString()}</strong></p>

          {currentStop ? (
            <div className="stop-details">
              <h3>{currentStop.city}</h3>
              <p>Amount Added: <strong>${currentStop.amount.toLocaleString()}</strong></p>
            </div>
          ) : (
            <p>Click on a port to see details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsumerPage;
