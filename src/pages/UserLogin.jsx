import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; // ✅ for web navigation
import api from "../instance/TokenInstance"; // ✅ axios instance

// ✅ Toast Component
const Toast = React.forwardRef((_, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  React.useImperativeHandle(ref, () => ({
    show: (msg) => {
      setMessage(msg);
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
        setMessage("");
      }, 2500);
    },
  }));

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#eef3f7",
        color: "#053B90",
        padding: "10px 20px",
        borderRadius: "20px",
        fontWeight: "600",
        zIndex: 9999,
        boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
      }}
    >
      {message}
    </div>
  );
});

const RegisterLogin = ({ setAppUser }) => {
  const [isActive, setIsActive] = useState(false); // toggle between login/register UI
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const toastRef = useRef();
  const showToast = (msg) => toastRef.current?.show(msg);
  const navigate = useNavigate(); // ✅ router navigation

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // 🔹 LOGIN → Direct (no OTP)
  const handleLogin = async (e) => {
    e.preventDefault();
    setMode("login");

    if (!formData.phone || !formData.password) {
      showToast("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/user/signin-user", {
        phone_number: formData.phone,
        password: formData.password,
      });

      showToast(res.data.message || "Login successful!");

      // ✅ Save user and navigate
      if (setAppUser) {
        setAppUser({ userId: res.data.user?._id });
      }

      navigate("/home-web"); // ✅ redirect on success

      // Reset form
      setFormData({
        name: "",
        phone: "",
        password: "",
        confirmPassword: "",
        otp: "",
      });
    } catch (err) {
      console.error("Login error:", err);
      showToast(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 REGISTER → Send OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    setMode("register");

    if (
      !formData.name ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      showToast("Please fill all fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match");
      return;
    }
    if (formData.phone.length !== 10 || isNaN(formData.phone)) {
      showToast("Phone number must be 10 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/user/send-register-otp", {
        full_name: formData.name,
        phone_number: formData.phone,
        password: formData.password,
      });

      showToast(res.data.message || "OTP sent successfully!");
      setIsOtpStep(true);
    } catch (err) {
      console.error("Register error:", err);
      showToast(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 REGISTER → Verify OTP & Create User
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!formData.otp) {
      showToast("Please enter OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/user/verify-register-otp", {
        phone_number: formData.phone,
        otp: formData.otp,
      });

      if (!res.data.success) {
        showToast(res.data.message || "OTP verification failed");
        return;
      }

      // ✅ Create user in DB
      const signupRes = await api.post("/user/signup-user", {
        full_name: formData.name,
        phone_number: formData.phone,
        password: formData.password,
        track_source: "chit-cust-web",
      });

      showToast(signupRes.data.message || "Registration successful!");

      // ✅ Save user and navigate
      if (setAppUser) {
        setAppUser({ userId: signupRes.data.user?._id });
      }

      navigate("/home-web"); // ✅ redirect after register success

      // Reset
      setIsActive(false);
      setIsOtpStep(false);
      setFormData({
        name: "",
        phone: "",
        password: "",
        confirmPassword: "",
        otp: "",
      });
    } catch (err) {
      console.error("Verify OTP error:", err);
      showToast(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toastRef} />

      {/* === Styles === */}
      <style>{`
        body { margin:0; padding:0; font-family: 'Arial', sans-serif;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          height: 100vh; display:flex; justify-content:center; align-items:center;}
        .main-container {width:900px; height:550px; display:flex; border-radius:20px; 
          overflow:hidden; box-shadow:0 15px 35px rgba(0,0,0,0.5); background:#1c1c1c;}
        .container {position:relative; flex:1; background:#111827; color:#fff;
          transition:transform 0.7s ease-in-out; overflow:hidden;}
        .form-box {position:absolute; top:0; width:100%; height:100%; padding:40px;
          box-sizing:border-box; transition:0.7s ease;}
        .form-box h2 {text-align:center; margin-bottom:20px; font-size:26px; color:#00bfff;}
        .input-box {position:relative; margin:20px 0;}
        .input-box input {width:100%; padding:10px; background:transparent; border:none;
          border-bottom:2px solid #aaa; color:#fff; font-size:16px; outline:none;}
        .input-box label {position:absolute; top:10px; left:0; pointer-events:none;
          transition:0.3s; color:#aaa;}
        .input-box input:focus ~ label,
        .input-box input:valid ~ label {top:-15px; font-size:12px; color:#00bfff;}
        .btn {width:100%; padding:12px; border:none; border-radius:25px;
          background:linear-gradient(45deg, #00bfff, #1e90ff); color:#fff; font-size:16px;
          font-weight:bold; cursor:pointer; margin-top:20px; transition:0.3s;}
        .btn:disabled {opacity:0.6; cursor:not-allowed;}
        .btn:hover:not(:disabled) {opacity:0.9;}
        .switch {margin-top:20px; text-align:center; font-size:14px;}
        .switch span {color:#00bfff; cursor:pointer; font-weight:bold;}
        .login {left:0; opacity:1; z-index:2; transition:all 0.7s ease;}
        .register {left:100%; opacity:0; z-index:1; transition:all 0.7s ease;}
        .container.active .login {transform:translateX(-100%); opacity:0; z-index:1;}
        .container.active .register {transform:translateX(-100%); opacity:1; z-index:2;}
        .info-section {flex:1; background:linear-gradient(135deg, #1e3c72, #2a5298); 
          color:#fff; display:flex; flex-direction:column; justify-content:center; 
          align-items:center; padding:40px; text-align:center;}
        .info-section img {width:80px; height:80px; border-radius:50%; margin-bottom:15px;
          box-shadow:0 5px 15px rgba(0,0,0,0.3);}
        .info-section h1 {font-size:32px; font-weight:bold; margin-bottom:20px; color:#fff;}
        .info-section p {font-size:16px; line-height:1.6; max-width:300px;}
      `}</style>

      <div className="main-container">
        {/* Left Forms */}
        <div className={`container ${isActive ? "active" : ""}`}>
          {/* LOGIN */}
          <div className="form-box login">
            <h2>User Login</h2>
            <form onSubmit={handleLogin}>
              <div className="input-box">
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <label>Phone</label>
              </div>
              <div className="input-box">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <label>Password</label>
              </div>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
              <p className="switch">
                Don’t have an account?{" "}
                <span
                  onClick={() => {
                    setIsActive(true);
                    setIsOtpStep(false);
                  }}
                >
                  Sign Up
                </span>
              </p>
            </form>
          </div>

          {/* REGISTER */}
          <div className="form-box register">
            <h2>User Sign Up</h2>
            {!isOtpStep ? (
              <form onSubmit={handleRegister}>
                <div className="input-box">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <label>Full Name</label>
                </div>
                <div className="input-box">
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  <label>Phone Number</label>
                </div>
                <div className="input-box">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <label>Password</label>
                </div>
                <div className="input-box">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <label>Confirm Password</label>
                </div>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </button>
                <p className="switch">
                  Already have an account?{" "}
                  <span
                    onClick={() => {
                      setIsActive(false);
                      setIsOtpStep(false);
                    }}
                  >
                    Login
                  </span>
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="input-box">
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                  />
                  <label>Enter OTP</label>
                </div>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Info */}
        <div className="info-section">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQJ8fYA1ljPLBn6-oBcnQk3aHReC7Kyeff6A&s"
            alt="Logo"
          />
          <h1>WELCOME TO MyChits</h1>
          <p>
            We are happy to have you back!  
            MyChits helps you manage chit funds, members, payments, and auctions with ease.  
            If you need help, we are here for you!
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterLogin;
