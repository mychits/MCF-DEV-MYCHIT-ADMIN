import React, { useEffect, useState } from "react";

const HomeWeb = () => {
  const [userName, setUserName] = useState("Guest");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // ✅ Replace with your API call
    setUserName("John Doe");
  }, []);

  const services = [
    { name: "Savings Plans", icon: "🏦" },
    { name: "Easy Payments", icon: "💳" },
    { name: "Smart Growth", icon: "📈" },
    { name: "Secure Wallet", icon: "🛡️" },
  ];

  const handleWebsiteLink = () => {
    window.open("https://example.com", "_blank");
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/919876543210", "_blank");
  };

  return (
    <div style={styles.container}>
      {/* ✅ Animated Gradient Header */}
      <header style={styles.header}>
        <h1 style={styles.headerText}>👋 Welcome, {userName}</h1>
        <p style={styles.subHeader}>Your trusted partner in smart savings</p>
      </header>

      {/* ✅ Services Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>✨ Our Services</h2>
        <div style={styles.servicesGrid}>
          {services.map((service, index) => (
            <div key={index} style={styles.serviceCard}>
              <div style={styles.serviceIcon}>{service.icon}</div>
              <p style={styles.serviceText}>{service.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ Why Choose Us */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>💡 Why Choose MyChits?</h2>
        <ul style={styles.benefitsList}>
          <li style={styles.benefitItem}>✔️ 100% Secure & Trusted</li>
          <li style={styles.benefitItem}>📞 24/7 Customer Support</li>
          <li style={styles.benefitItem}>💰 Transparent Payments</li>
          <li style={styles.benefitItem}>⚡ Fast & Reliable Service</li>
        </ul>
      </section>

      {/* ✅ Floating Action Buttons */}
      <div style={styles.floatingButtons}>
        <button style={styles.floatButton} onClick={handleWebsiteLink}>
          🌐
        </button>
        <button style={styles.floatButton} onClick={handleWhatsApp}>
          💬
        </button>
        <button style={styles.floatButton} onClick={() => setModalVisible(true)}>
          ❓
        </button>
      </div>

      {/* ✅ Help Modal */}
      {modalVisible && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Need Help? 🤝</h3>
            <p style={styles.modalText}>
              Contact our support team anytime via WhatsApp or Email.
            </p>
            <div>
              <button
                style={styles.modalActionButton}
                onClick={handleWhatsApp}
              >
                💬 WhatsApp
              </button>
              <button
                style={{ ...styles.modalActionButton, background: "#555" }}
                onClick={() => setModalVisible(false)}
              >
                ✖ Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Footer */}
      <footer style={styles.footer}>
        <p>Made with ❤️ by MyChits | All Rights Reserved © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "#f9fafc",
    minHeight: "100vh",
    position: "relative",
    overflowX: "hidden",
  },
  header: {
    background: "linear-gradient(135deg, #004, #0066cc)",
    padding: "40px 20px",
    textAlign: "center",
    color: "#fff",
  },
  headerText: {
    fontSize: "28px",
    fontWeight: "bold",
    margin: 0,
    animation: "fadeIn 2s ease-in-out",
  },
  subHeader: {
    marginTop: "8px",
    fontSize: "16px",
    opacity: 0.9,
  },
  section: {
    backgroundColor: "#fff",
    margin: "20px",
    padding: "25px",
    borderRadius: "14px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "16px",
    textAlign: "center",
  },
  servicesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
  },
  serviceCard: {
    backgroundColor: "#fdfdfd",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  serviceCardHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
  },
  serviceIcon: {
    fontSize: "40px",
  },
  serviceText: {
    marginTop: "10px",
    fontSize: "15px",
    fontWeight: "500",
  },
  benefitsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  benefitItem: {
    fontSize: "15px",
    margin: "8px 0",
    padding: "8px 12px",
    background: "#f2f6ff",
    borderRadius: "8px",
  },
  floatingButtons: {
    position: "fixed",
    right: "20px",
    bottom: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  floatButton: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    border: "none",
    background: "#004",
    color: "#fff",
    fontSize: "22px",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    transition: "transform 0.3s ease",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "14px",
    width: "400px",
    maxWidth: "90%",
    textAlign: "center",
    animation: "fadeInScale 0.4s ease",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "10px",
  },
  modalText: {
    fontSize: "15px",
    marginBottom: "20px",
  },
  modalActionButton: {
    background: "#004",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    margin: "0 6px",
  },
  footer: {
    background: "linear-gradient(135deg, #004, #0066cc)",
    color: "#fff",
    textAlign: "center",
    padding: "15px",
    marginTop: "40px",
  },
};

export default HomeWeb;
