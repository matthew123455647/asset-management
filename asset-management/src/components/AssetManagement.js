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
    const [btcModalVisible, setBtcModalVisible] = useState(false);
    const [depositAmount, setDepositAmount] = useState("");
    const [selectedCurrency, setSelectedCurrency] = useState("SGD");
    const [exchangeRates, setExchangeRates] = useState({});
    const [totalAssetValue, setTotalAssetValue] = useState(0);
    const [btcToUsdRate, setBtcToUsdRate] = useState(0); // BTC to USD rate
    const [notification, setNotification] = useState("");
    const [modalAmount, setModalAmount] = useState('');  // Add this line for modal amount
    const [notificationVisible, setNotificationVisible] = useState(false);

    useEffect(() => {
        const fetchExchangeRates = async () => {
            try {
                const response = await axios.get("https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_hBfofqKfn1IYRgCH36cP9JbVL5uWNykz4uu248Ju");

                console.log("API Response:", response.data);  // Check full API response

                setExchangeRates(response.data.data);
            } catch (error) {
                console.error("Error fetching exchange rates:", error);
            }
        };

        fetchExchangeRates();

        const fetchBtcToUsdRate = async () => {
            try {
                const response = await axios.get(
                    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
                );
                setBtcToUsdRate(response.data.bitcoin.usd);
            } catch (error) {
                console.error("Error fetching BTC to USD rate:", error);
            }
        };

        fetchExchangeRates();
        fetchBtcToUsdRate();
    }, []);

    const toggleModal = () => setModalVisible(!modalVisible);
    const toggleBtcModal = () => setBtcModalVisible(!btcModalVisible);
    const navigate = useNavigate();

    const handleDeposit = (amountCurrency) => {
        const exchangeRate = exchangeRates[selectedCurrency];

        if (!exchangeRate) {
            alert("Exchange rate not available for selected currency.");
            return;
        }

        // Check if the API provides 1 USD = X RUB or 1 RUB = X USD
        const isInverted = exchangeRates["USD"] > exchangeRates["RUB"]; // If USD rate is higher than RUB rate, it needs inversion
        const correctedRate = isInverted ? (1 / exchangeRate) : exchangeRate;

        const amountUSD = parseFloat(amountCurrency) / correctedRate;

        console.log(`Converted ${amountCurrency} ${selectedCurrency} to ${amountUSD} USD`);

        // Update total assets
        const newTotalAssetValue = totalAssetValue + amountUSD;
        setTotalAssetValue(newTotalAssetValue);

        // Update overall portfolio distribution
        setOverallData((prevData) =>
            prevData.map((item) => ({
                ...item,
                passive: item.passive + amountUSD * (item.passive / newTotalAssetValue),
                aggressive: item.aggressive + amountUSD * (item.aggressive / newTotalAssetValue),
                balanced: item.balanced + amountUSD * (item.balanced / newTotalAssetValue),
            }))
        );

        // Format USD amount for display consistency
        const formattedAmountUSD = amountUSD.toLocaleString(undefined, {
            minimumFractionDigits: 6,
            maximumFractionDigits: 6
        });

        // Update modal with correct values
        setDepositAmount("");
        setModalVisible(false);

        // Show correct conversion in the modal & notification
        showNotification(`Deposited ${amountCurrency} ${selectedCurrency}, equivalent to USD ${formattedAmountUSD}`);

        // Assuming the modal has a state variable `modalAmount`
        setModalAmount(formattedAmountUSD);
    };

    const handleBtcDeposit = (btcAmount) => {
        const btcInUsd = parseFloat(btcAmount) * btcToUsdRate;
        if (!btcToUsdRate) {
            alert("BTC to USD exchange rate not available.");
            return;
        }

        const newTotalAssetValue = totalAssetValue + btcInUsd;
        setTotalAssetValue(newTotalAssetValue);

        setOverallData((prevData) =>
            prevData.map((item) => ({
                ...item,
                passive: item.passive + btcInUsd * (item.passive / newTotalAssetValue),
                aggressive: item.aggressive + btcInUsd * (item.aggressive / newTotalAssetValue),
                balanced: item.balanced + btcInUsd * (item.balanced / newTotalAssetValue),
            }))
        );

        setDepositAmount("");
        setBtcModalVisible(false);
        showNotification(`Deposited ${btcAmount} BTC, equivalent to USD ${btcInUsd.toFixed(2)}`);
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

                const newTotalAssetValue = newData.reduce((acc, item) => acc + item.passive + item.aggressive + item.balanced, 0);
                setTotalAssetValue(newTotalAssetValue);

                return newData;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Updated Pie Chart Data - Passive, Aggressive, Balanced
    const pieData = [
        { name: "Passive", value: overallData.reduce((acc, item) => acc + item.passive, 0) },
        { name: "Aggressive", value: overallData.reduce((acc, item) => acc + item.aggressive, 0) },
        { name: "Balanced", value: overallData.reduce((acc, item) => acc + item.balanced, 0) },
    ];

    const COLORS = ["#0088FE", "#00C49F", "#FF8042"];

    const calculateSelectedPortfolioValue = () => {
        return overallData.reduce((acc, item) => acc + item[portfolioType.toLowerCase()], 0);
    };

    const showNotification = (message) => {
        setNotification(message);
        setNotificationVisible(true);
        setTimeout(() => setNotificationVisible(false), 5000);
    };

    return (
        <div style={theme === "dark" ? styles.darkContainer : styles.lightContainer}>
            <nav style={styles.navbar}>
                <h2>Bryan's Portfolio</h2>
                <div style={styles.navButtons}>
                    <button style={styles.navButton} onClick={toggleModal}>
                        <FaDollarSign /> Deposit (Forex)
                    </button>
                    <button style={styles.navButton} onClick={toggleBtcModal}>
                        <FaExchangeAlt /> Deposit BTC
                    </button>
                    <button style={styles.navButton} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
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
                <p style={styles.cardValue}>Total: USD {totalAssetValue.toFixed(2)}</p>
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

            {/* Forex Deposit Modal */}
            {modalVisible && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h3 style={styles.modalTitle}>Deposit Forex Amount</h3>
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
                        <p>
                            Equivalent in USD:
                            {(
                                depositAmount * (selectedCurrency === "USD" ? 1 : (1 / (exchangeRates[selectedCurrency] || 1)))
                            ).toFixed(4)}
                        </p>
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

            {/* BTC Deposit Modal */}
            {btcModalVisible && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h3 style={styles.modalTitle}>Deposit BTC Amount</h3>
                        <input
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            style={styles.input}
                            placeholder="Enter amount in BTC"
                        />
                        <p>Equivalent in USD: USD {(depositAmount * btcToUsdRate).toFixed(2)}</p>
                        <div style={styles.modalButtons}>
                            <button onClick={() => handleBtcDeposit(depositAmount)} style={styles.modalButton}>
                                Deposit
                            </button>
                            <button onClick={toggleBtcModal} style={styles.modalCloseButton}>
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
