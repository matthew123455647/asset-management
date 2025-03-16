import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { FaDollarSign, FaSun, FaMoon, FaExchangeAlt } from "react-icons/fa";

const TradingDashboard = () => {
    const [portfolioType, setPortfolioType] = useState("Passive");
    const [theme, setTheme] = useState("dark");
    const [overallData, setOverallData] = useState([
        { name: "Jan", passive: 1500, aggressive: 2000, balanced: 1500 },
        { name: "Feb", passive: 1400, aggressive: 1800, balanced: 1300 },
        { name: "Mar", passive: 1600, aggressive: 2200, balanced: 1800 },
        { name: "Apr", passive: 1700, aggressive: 2300, balanced: 2100 },
        { name: "May", passive: 1600, aggressive: 2400, balanced: 1900 },
    ]);
    const [modalVisible, setModalVisible] = useState(false);
    const [depositAmount, setDepositAmount] = useState("");
    const [selectedCurrency, setSelectedCurrency] = useState("SGD"); // Currency selection state
    const [exchangeRates, setExchangeRates] = useState({}); // Store multiple exchange rates
    const [totalAssetValue, setTotalAssetValue] = useState(0); // Initialize total asset value in USD
    const [notification, setNotification] = useState(""); // State for notification message
    const [notificationVisible, setNotificationVisible] = useState(false); // State for notification visibility

    useEffect(() => {
        const fetchExchangeRates = async () => {
            try {
                const response = await axios.get(
                    "https://api.exchangerate-api.com/v4/latest/USD" // Fetch exchange rates based on USD
                );
                setExchangeRates(response.data.rates);
            } catch (error) {
                console.error("Error fetching exchange rates:", error);
            }
        };

        fetchExchangeRates();
    }, []);

    const toggleModal = () => setModalVisible(!modalVisible);

    const navigate = useNavigate();

    const handleDeposit = (amountCurrency) => {
        const exchangeRate = exchangeRates[selectedCurrency];
        if (!exchangeRate) {
            alert("Exchange rate not available for selected currency.");
            return;
        }
        const amountUSD = parseFloat(amountCurrency) * exchangeRate; // Convert to USD
        const newTotalAssetValue = totalAssetValue + amountUSD;
        setTotalAssetValue(newTotalAssetValue); // Update the total asset value

        setOverallData((prevData) =>
            prevData.map((item) => ({
                ...item,
                passive: item.passive + amountUSD * (item.passive / newTotalAssetValue),
                aggressive: item.aggressive + amountUSD * (item.aggressive / newTotalAssetValue),
                balanced: item.balanced + amountUSD * (item.balanced / newTotalAssetValue),
            }))
        );

        setDepositAmount("");
        setModalVisible(false);
        showNotification(`Deposited ${amountCurrency} ${selectedCurrency}, equivalent to ${amountUSD.toFixed(2)} USD`);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setOverallData((prevData) => {
                const newData = prevData.map((item) => ({
                    ...item,
                    passive: item.passive + Math.floor(Math.random() * 1000 - 500),
                    aggressive: item.aggressive + Math.floor(Math.random() * 1000 - 500),
                    balanced: item.balanced + Math.floor(Math.random() * 1000 - 500),
                }));

                // Calculate the new total asset value after the data update
                const newTotalAssetValue = newData.reduce((acc, item) => acc + item.passive + item.aggressive + item.balanced, 0);
                setTotalAssetValue(newTotalAssetValue); // Update the total asset value

                return newData;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const pieData = [
        { name: "Stocks", value: 40 },
        { name: "Bonds", value: 30 },
        { name: "Crypto", value: 20 },
        { name: "Commodities", value: 10 },
    ];

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

    const calculateSelectedPortfolioValue = () => {
        return overallData.reduce((acc, item) => acc + item[portfolioType.toLowerCase()], 0);
    };

    const showNotification = (message) => {
        setNotification(message);
        setNotificationVisible(true);
        setTimeout(() => setNotificationVisible(false), 5000); // Hide notification after 5 seconds
    };

    return (
        <div style={theme === "dark" ? styles.darkContainer : styles.lightContainer}>
            <nav style={styles.navbar}>
                <h2>Dex Portfolio</h2>
                <div style={styles.navButtons}>
                    <button style={styles.navButton} onClick={toggleModal}>
                        <FaDollarSign /> Deposit
                    </button>
                    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={styles.navButton}>
                        {theme === "dark" ? <FaSun /> : <FaMoon />} Toggle Theme
                    </button>
                </div>
            </nav>

            <h1 style={styles.title}>Trading Dashboard</h1>

            <div style={styles.overviewCard}>
                <div style={styles.cardHeader}>
                    <FaDollarSign style={styles.cardIcon} />
                    <h2>Overview Asset Value</h2>
                </div>
                <p style={styles.cardValue}>Total: ${totalAssetValue.toFixed(2)}</p> {/* Display total in USD */}
            </div>

            <div style={styles.chartContainer}>
                <h2 style={styles.chartTitle}>Overall Market Performance</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={overallData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                        <XAxis dataKey="name" stroke="#ccc" />
                        <YAxis stroke="#ccc" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="passive" stroke="#ffcc00" strokeWidth={2} />
                        <Line type="monotone" dataKey="aggressive" stroke="#00C49F" strokeWidth={2} />
                        <Line type="monotone" dataKey="balanced" stroke="#FF8042" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div style={styles.chartContainer}>
                <h2 style={styles.chartTitle}>Portfolio Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div style={styles.buttonGroup}>
                <button onClick={() => setPortfolioType("Passive")} style={styles.portfolioButton}>
                    Passive
                </button>
                <button onClick={() => setPortfolioType("Balanced")} style={styles.portfolioButton}>
                    Balanced
                </button>
                <button onClick={() => setPortfolioType("Aggressive")} style={styles.portfolioButton}>
                    Aggressive
                </button>
            </div>

            <div style={styles.card}>
                <h3>{portfolioType} Portfolio Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={overallData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                        <XAxis dataKey="name" stroke="#ccc" />
                        <YAxis stroke="#ccc" />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey={portfolioType.toLowerCase()}
                            stroke={portfolioType === "Passive" ? "#ffcc00" : portfolioType === "Balanced" ? "#FF8042" : "#00C49F"}
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {modalVisible && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h3 style={styles.modalTitle}>Deposit Amount</h3>
                        <div style={styles.currencySelector}>
                            <label htmlFor="currency">Select Currency:</label>
                            <select
                                id="currency"
                                value={selectedCurrency}
                                onChange={(e) => setSelectedCurrency(e.target.value)}
                                style={styles.currencyDropdown}
                            >
                                {Object.keys(exchangeRates).map((currency) => (
                                    <option key={currency} value={currency}>
                                        {currency}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <input
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            style={styles.input}
                            placeholder={`Enter amount in ${selectedCurrency}`}
                        />
                        <p>Equivalent in USD: ${(depositAmount * (exchangeRates[selectedCurrency] || 1)).toFixed(2)}</p>
                        <div style={styles.modalButtons}>
                            <button onClick={() => handleDeposit(depositAmount)} style={styles.modalButton}>
                                Deposit
                            </button>
                            <button onClick={toggleModal} style={styles.modalCloseButton}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {notificationVisible && (
                <div style={styles.notification}>
                    {notification}
                </div>
            )}
        </div>
    );
};

const styles = {
    darkContainer: {
        minHeight: "100vh",
        backgroundColor: "#0d1117",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
    },

    lightContainer: {
        minHeight: "100vh",
        backgroundColor: "#f0f0f0",
        color: "black",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
    },

    navbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#161b22",
        padding: "10px 20px",
        borderRadius: "5px",
        width: "100%",
        maxWidth: "1200px",
    },

    navButtons: {
        display: "flex",
        gap: "10px",
        marginLeft: "auto",
    },

    navButton: {
        padding: "10px",
        backgroundColor: "#4b7bec",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "14px",
    },

    title: {
        fontSize: "24px",
        textAlign: "center",
        marginTop: "20px",
    },

    chartContainer: {
        marginTop: "30px",
        backgroundColor: "#21262d",
        padding: "20px",
        borderRadius: "10px",
        width: "100%",
        maxWidth: "1200px",
    },

    chartTitle: {
        fontSize: "20px",
        color: "white",
        marginBottom: "20px",
    },

    overviewCard: {
        backgroundColor: "#21262d",
        padding: "20px",
        borderRadius: "10px",
        marginTop: "30px",
        width: "100%",
        maxWidth: "1200px",
    },

    cardHeader: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },

    cardIcon: {
        fontSize: "30px",
        color: "#ffcc00",
    },

    cardValue: {
        fontSize: "18px",
        color: "#ffcc00",
        marginTop: "10px",
    },

    buttonGroup: {
        marginTop: "30px",
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        width: "100%",
        maxWidth: "1200px",
    },

    portfolioButton: {
        padding: "10px",
        backgroundColor: "#4b7bec",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
    },

    card: {
        marginTop: "30px",
        backgroundColor: "#21262d",
        padding: "20px",
        borderRadius: "10px",
        width: "100%",
        maxWidth: "1200px",
    },

    modal: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1001,
    },

    modalContent: {
        backgroundColor: "#21262d",
        padding: "20px",
        borderRadius: "10px",
        width: "100%",
        maxWidth: "400px",
        color: "white",
    },

    modalTitle: {
        fontSize: "24px",
        marginBottom: "20px",
        textAlign: "center",
    },

    currencySelector: {
        marginTop: "10px",
    },

    currencyDropdown: {
        width: "100%",
        padding: "10px",
        backgroundColor: "#161b22",
        color: "white",
        border: "1px solid #ccc",
        borderRadius: "5px",
    },

    input: {
        width: "94%",
        padding: "10px",
        backgroundColor: "#161b22",
        color: "white",
        border: "1px solid #ccc",
        borderRadius: "5px",
        marginTop: "20px",
    },

    modalButtons: {
        marginTop: "20px",
        display: "flex",
        justifyContent: "space-between",
    },

    modalButton: {
        padding: "10px",
        backgroundColor: "#4b7bec",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },

    modalCloseButton: {
        padding: "10px",
        backgroundColor: "#ff4040",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },

    notification: {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#4CAF50",
        color: "white",
        padding: "10px 20px",
        borderRadius: "5px",
        fontSize: "14px",
        zIndex: 1000,
    },
};

export default TradingDashboard;
