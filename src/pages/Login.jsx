import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../instance/TokenInstance";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); 
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // for popup visibility
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    try {
      const response = await api.post(`/admin/login`, {
        phoneNumber,
        password,
      });

      const { token } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response?.data?.admin));

      // Show popup success message
      setSuccessMessage("Welcome to MyChits!!Turn your Financial Dreams into Reality !!");
      setShowSuccessPopup(true);

      setTimeout(() => {
        setShowSuccessPopup(false);
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setError("Invalid phone number or password.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    try {
      const response = await api.post(`/admin/register`, {
        username,
        phoneNumber,
        password,
      });

      const { token } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response?.data?.admin));

      // Show popup success message
      setSuccessMessage("Registration successful. Redirecting to dashboard...");
      setShowSuccessPopup(true);

      setTimeout(() => {
        setShowSuccessPopup(false);
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setError("Registration failed. Try again.");
    }
  };

  return (
    <>
      <style>{`
        @import url("https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css");

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: Arial, sans-serif;
        }

        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(to right, #6a11cb, #2575fc);
        }

        .form-box {
          background: #fff;
          width: 900px;
          height: 600px;
          position: relative;
          overflow: hidden;
          border-radius: 15px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          display: flex;
        }

        .form-container {
          width: 50%;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          transition: all 0.6s ease;
        }

        .signin-box {
          z-index: 2;
        }

        .signup-box {
          opacity: 0;
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 50%;
        }

        .form-box.active .signup-box {
          opacity: 1;
          z-index: 2;
          transform: translateX(100%);
        }

        .form-box.active .signin-box {
          transform: translateX(100%);
          opacity: 0;
          z-index: 1;
        }

        .overlay-container {
          width: 50%;
          background: linear-gradient(to right, #6a11cb, #2575fc);
          color: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          text-align: center;
          transition: all 0.6s ease;
        }

        .form-box.active .overlay-container {
          transform: translateX(-100%);
        }

        h2 {
          margin-bottom: 1.5rem;
        }

        .input-box {
          position: relative;
          margin-bottom: 1.2rem;
        }

        .input-box input {
          width: 100%;
          padding: 10px 35px 10px 10px;
          border: none;
          border-bottom: 2px solid #ccc;
          outline: none;
          font-size: 1rem;
          transition: 0.3s;
          background: transparent;
        }

        .input-box input:focus {
          border-bottom: 2px solid #6a11cb;
        }

        .input-box label {
          position: absolute;
          top: -18px;
          left: 0;
          font-size: 0.9rem;
          color: #666;
        }

        .input-box i {
          position: absolute;
          right: 10px;
          top: 30%;
          font-size: 1.2rem;
          color: #6a11cb;
        }

        .forgot {
          font-size: 0.9rem;
          color: #666;
          cursor: pointer;
          margin-bottom: 1rem;
        }

        .btn {
          width: 100%;
          padding: 10px;
          border: none;
          background: linear-gradient(to right, #6a11cb, #2575fc);
          color: white;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          transition: 0.3s;
        }

        .btn:hover {
          transform: scale(1.05);
        }

        .error-text {
          color: red;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        /* Popup success message styling */
        .success-popup {
          position: fixed;
          top: 30px;
          left: 50%;
          transform: translateX(-50%);
          background-color: white;
          color: green;
          padding: 15px 25px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          font-weight: bold;
          font-size: 1rem;
          z-index: 1100;
          animation: fadeInOut 2.5s forwards;
          text-align: center;
          min-width: 300px;
        }

        @keyframes fadeInOut {
          0% {opacity: 0; transform: translateX(-50%) translateY(-20px);}
          10% {opacity: 1; transform: translateX(-50%) translateY(0);}
          90% {opacity: 1; transform: translateX(-50%) translateY(0);}
          100% {opacity: 0; transform: translateX(-50%) translateY(-20px);}
        }

        .overlay-btn {
          background: transparent;
          border: 2px solid #fff;
          color: #fff;
          padding: 10px 25px;
          border-radius: 25px;
          cursor: pointer;
          transition: 0.3s;
          margin-top: 1rem;
          font-weight: bold;
        }

        .overlay-btn:hover {
          background: #fff;
          color: #6a11cb;
        }

        .logo {
          width: 150px;
          margin-bottom: 1rem;
        }

        /* Social Icons below Sign In button */
        .social-icons {
          margin-top: 15px;
          display: flex;
          justify-content: center;
          gap: 30px;
        }

        .social-icons i {
          font-size: 2.4rem;
          color: #6a11cb;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .social-icons i:hover {
          color: #2575fc;
        }
      `}</style>

      <div className="auth-container">
        <div className={`form-box ${isSignUp ? "active" : ""}`}>
          {/* Sign In Form */}
          <div className="form-container signin-box">
            <img
              src="https://www.mychits.co.in/assets/images/logo.png"
              alt="MyChits Logo"
              className="logo"
            />
            <h2>Sign In</h2>
            <form onSubmit={handleLogin}>
              {error && <p className="error-text">{error}</p>}

              <div className="input-box">
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <label>Phone Number</label>
                <i className="bx bxs-phone"></i>
              </div>
              <div className="input-box">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label>Password</label>
                <i className="bx bxs-lock-alt"></i>
              </div>
              <p className="forgot">Forgot Your Password?</p>
              <button type="submit" className="btn">Sign In</button>

              {/* Social Icons */}
              <div className="social-icons" aria-label="Social media login options">
                <i
                  className="bx bxl-facebook-square"
                  title="Login with Facebook"
                  role="button"
                  tabIndex={0}
                  onClick={() => window.open("https://www.facebook.com/Mychitfund/", "_blank")}
                  onKeyDown={(e) => { if(e.key === 'Enter') window.open("https://www.facebook.com", "_blank"); }}
                ></i>
                <i
                  className="bx bxl-instagram"
                  title="Login with Instagram"
                  role="button"
                  tabIndex={0}
                  onClick={() => window.open("https://www.instagram.com/my_chits/?igsh=bGV3a2Z2bnE0dmJ6#", "_blank")}
                  onKeyDown={(e) => { if(e.key === 'Enter') window.open("https://www.instagram.com", "_blank"); }}
                ></i>
              </div>
            </form>
          </div>

          {/* Sign Up Form */}
          <div className="form-container signup-box">
            <img
              src="https://www.mychits.co.in/assets/images/logo.png"
              alt="MyChits Logo"
              className="logo"
            />
            <h2>Create Account</h2>
            <form onSubmit={handleRegister}>
              {error && <p className="error-text">{error}</p>}

              <div className="input-box">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <label>Username</label>
                <i className="bx bxs-user"></i>
              </div>
              <div className="input-box">
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <label>Phone Number</label>
                <i className="bx bxs-phone"></i>
              </div>
              <div className="input-box">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label>Password</label>
                <i className="bx bxs-lock-alt"></i>
              </div>
              <button type="submit" className="btn">Sign Up</button>
            </form>
          </div>

          {/* Overlay Info Section */}
          <div className="overlay-container">
            {!isSignUp ? (
              <>
                <h2>Hello, MyChits!</h2>
                <p>
                  Secure and simple financial chit management made easy.
                  Track your savings, grow your wealth, and join a trusted finance community.
                </p>
                <button onClick={() => setIsSignUp(true)} className="overlay-btn">
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <h2>Welcome Back!</h2>
                <p>
                  Already a member of MyChits? Sign in to manage your chits,
                  track finances, and continue your journey to financial freedom.
                </p>
                <button onClick={() => setIsSignUp(false)} className="overlay-btn">
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>

        {/* Success message popup */}
        {showSuccessPopup && (
          <div className="success-popup" role="alert" aria-live="assertive">
            {successMessage}
          </div>
        )}
      </div>
    </>
  );
};

export default Login;
