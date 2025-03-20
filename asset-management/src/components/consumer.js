import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./styles.css"; // Import your normal CSS file

const ConsumerPage = () => {
  const [currentStop, setCurrentStop] = useState(null);
  const [shipPosition, setShipPosition] = useState({ lat: 22.3193, lng: 114.1694 });
  const [progress, setProgress] = useState(0);
  const [money, setMoney] = useState(0);
  const [loanAmount, setLoanAmount] = useState(0);
  const [maxLoanAmount, setMaxLoanAmount] = useState(0); // Max loan amount state
  const [modalType, setModalType] = useState(null);
  const [inputValue, setInputValue] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState(""); // Feedback message for deposit/loan

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

  const openModal = (type) => {
    setModalType(type);
    setInputValue(0);
    setFeedbackMessage(""); // Reset feedback message
  };

  const closeModal = () => {
    setModalType(null);
  };

  const handleConfirm = () => {
    if (modalType === "deposit") {
      if (inputValue <= 0) {
        setFeedbackMessage("Please enter a valid deposit amount.");
      } else {
        setMoney((prev) => prev + inputValue);
        setMaxLoanAmount(inputValue * 5);
        setFeedbackMessage(`Deposit successful! You've deposited USD${inputValue}. Your max loan amount is USD${inputValue * 5}.`);
      }
    } else if (modalType === "loan") {
      if (inputValue <= 0) {
        setFeedbackMessage("Please enter a valid loan amount.");
      } else if (inputValue > maxLoanAmount) {
        setFeedbackMessage(`Loan amount exceeds available limit. Your max loan amount is USD${maxLoanAmount}.`);
      } else {
        setLoanAmount(inputValue);
        setFeedbackMessage(`Loan of USD${inputValue} granted!`);
      }
    }
    closeModal();
  };

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
                <Popup>{stop.city} - Amount Added: USD{stop.amount.toLocaleString()}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar Details */}
        <div className="details-container">
          <h2>Shipment Details</h2>
          <p>Total Transported Amount: <strong>USD{totalAmount.toLocaleString()}</strong></p>
          <p>Money: <strong>USD{money.toLocaleString()}</strong></p>
          <p>Max Loan Amount: <strong>USD{maxLoanAmount.toLocaleString()}</strong></p>
          <p>Loan Amount: <strong>USD{loanAmount.toLocaleString()}</strong></p>

          {currentStop ? (
            <div className="stop-details">
              <h3>{currentStop.city}</h3>
              <p>Amount Added: <strong>USD{currentStop.amount.toLocaleString()}</strong></p>
            </div>
          ) : (
            <p>Click on a port to see details</p>
          )}

          <button onClick={() => openModal("deposit")} className="btn">Deposit</button>
          <button onClick={() => openModal("loan")} className="btn">Take Loan</button>
        </div>
      </div>

      {modalType && (
        <div className="modal">
          <div className="modal-content">
            <h2>{modalType === "deposit" ? "Deposit Money" : "Take a Loan"}</h2>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              placeholder="Enter Amount"
            />
            <div className="modal-buttons">
              <button onClick={handleConfirm} className="btn">Confirm</button>
              <button onClick={closeModal} className="btn">Cancel</button>
            </div>

            {/* Display Feedback Message */}
            {feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumerPage;
