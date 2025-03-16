import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from './components/homepage.js'
import TradingDashboard from './components/AssetManagement.js';
import ConsumerPage from './components/consumer.js'; // Make sure this component exists

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<TradingDashboard />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/consumer" element={<ConsumerPage />} />
      </Routes>
    </Router>
  );
}

export default App;