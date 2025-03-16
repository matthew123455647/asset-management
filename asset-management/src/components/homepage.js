import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import logo from "../logo.jpg";
import heroBackground from "../homepage.jpg";



const Navbar = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Mock login logic (no authentication involved)
    alert("Login successful! Welcome back.");
    navigate("/consumer");
  }; 

  return (
    <nav className="navbar">
      <div className="logo-container">
        <img src={logo} alt="TradeX Logo" className="logo-img" />
      </div>
      <div className="nav-buttons">
        <button className="btn-outline">Sign Up</button>
        <button className="btn" onClick={handleLogin}>Login</button>
      </div>
    </nav>
  );
};

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="hero" style={{ backgroundImage: `url(${heroBackground})` }}>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h2>Your Gateway to Smarter Trading</h2>
        <p>Trade stocks, crypto, and forex with real-time analytics.</p>
        <button className="btn" onClick={() => navigate("/home")}>Get Started</button>
      </div>
    </div>
  );
};

const MarketData = () => {
  const [marketData, setMarketData] = useState([]);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano&vs_currencies=usd&include_24hr_change=true"
        );
        const data = await response.json();

        const formattedData = [
          {
            name: "Bitcoin",
            price: `$${data.bitcoin.usd.toLocaleString()}`,
            change: `${data.bitcoin.usd_24h_change.toFixed(2)}%`,
          },
          {
            name: "Ethereum",
            price: `$${data.ethereum.usd.toLocaleString()}`,
            change: `${data.ethereum.usd_24h_change.toFixed(2)}%`,
          },
          {
            name: "Cardano",
            price: `$${data.cardano.usd.toLocaleString()}`,
            change: `${data.cardano.usd_24h_change.toFixed(2)}%`,
          },
        ];

        setMarketData(formattedData);
      } catch (error) {
        console.error("Error fetching market data:", error);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 10000); // Refresh data every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="market">
      <h2>Market Overview</h2>
      <div className="market-container">
        {marketData.length > 0 ? (
          marketData.map((asset, index) => (
            <div key={index} className="market-card">
              <h3>{asset.name}</h3>
              <p>{asset.price}</p>
              <p className={asset.change.startsWith("-") ? "red" : "green"}>{asset.change}</p>
            </div>
          ))
        ) : (
          <p>Loading market data...</p>
        )}
      </div>
    </div>
  );
};

const FeaturedAssets = () => (
  <div className="features">
    <h2>Why Trade with Us?</h2>
    <div className="feature-items">
      {["Real-time Insights", "Low Trading Fees", "Secure Transactions", "User-Friendly Interface"].map((feature, index) => (
        <div key={index} className="feature-card">
          <p>{feature}</p>
        </div>
      ))}
    </div>
  </div>
);

const NewsSection = () => {
  const newsItems = [
    "Bitcoin hits new highs amid institutional adoption.",
    "Ethereum 2.0 upgrade boosts network efficiency.",
    "Stock market reacts to economic data releases.",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="news">
      <h2>Latest Market News</h2>
      <div className="news-slider">
        <button onClick={() => setCurrentIndex((prevIndex) => (prevIndex - 1 + newsItems.length) % newsItems.length)}>
          &#10094;
        </button>
        <p>{newsItems[currentIndex]}</p>
        <button onClick={() => setCurrentIndex((prevIndex) => (prevIndex + 1) % newsItems.length)}>
          &#10095;
        </button>
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="footer">
    <p>&copy; 2025 SILK ROSE. All rights reserved.</p>
  </footer>
);

const Homepage = () => {
  return (
    <div className="homepage-container">
      <Navbar />
      <HeroSection />
      <MarketData />
      <FeaturedAssets />
      <NewsSection />
      <Footer />
    </div>
  );
};

export default Homepage;