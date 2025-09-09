import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// ✅ Fully self-contained, production-ready, and accessible
// - Adds unique EMI Calculator, Play Store badge, improved carousel with pause-on-hover
// - Adds detailed Chit Plans, richer footer with legal & contact info
// - Fixes broken image URL, optimizes timers, improves a11y, and mobile layout
// - NEW: Header Login button that navigates to /userlogin-web

const Firstpage = () => {
  const navigate = useNavigate();

  // ------------------------------
  // Time, Thoughts, and Calendar
  // ------------------------------
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [thoughtIndex, setThoughtIndex] = useState(0);

  const thoughts = useMemo(
    () => [
      "✨ Your journey begins with a single step of discipline.",
      "🌱 Invest in growth today for a brighter tomorrow.",
      "💫 Small habits, grand futures.",
      "🚀 Leap forward with MyChits.",
      "🔥 Empower your future, one smart choice at a time.",
    ],
    []
  );

  const schemes = useMemo(
    () => [
      { title: "Classic Gold Loan", details: "Fast • Easy • Secure" },
      { title: "Anime Boost Loan", details: "Low Rate • High Fun!" },
      { title: "Super Saver Loan", details: "Max Value • Minimal Risk" },
    ],
    []
  );

  const offers = useMemo(
    () => [
      { img: "https://mychits.co.in/mychits-admin/views/assets/about/about.png", alt: "About MyChits" },
      { img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzLTfhoEWlXU_IyvY8W6m-nc3cGPsAf-A2sQ&s", alt: "Low Interest Offer" },
      { img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2dxO3_siiuXgQFjkAFvTwGtLY14aKTGH87g&s", alt: "Gold Loan Promo" },
      { img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOA_FO1b_thAiORuvOQOqegFqpyjBm6jR-iA&s", alt: "Festive Benefits" },
      // Fixed the bad URL that had a stray backtick
      { img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHIGE_HvMxOvXZnGeHaV1VoL-Ft8UGAOxgxBnjyUCNXUJBwK_yRkZ635ZlgbYZntFyX6g&usqp=CAU", alt: "Refer & Earn" },
    ],
    []
  );

  // update time every 1s, rotate thought every 5s
  useEffect(() => {
    const timeId = setInterval(() => setTime(new Date()), 1000);
    const thoughtId = setInterval(
      () => setThoughtIndex((i) => (i + 1) % thoughts.length),
      5000
    );
    return () => {
      clearInterval(timeId);
      clearInterval(thoughtId);
    };
  }, [thoughts.length]);

  const digitalTime = useMemo(() => time.toLocaleTimeString(), [time]);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const today = new Date();
  const m = date.getMonth();
  const y = date.getFullYear();

  const getDays = (mm, yy) => new Date(yy, mm + 1, 0).getDate();
  const getFirst = (mm, yy) => new Date(yy, mm, 1).getDay();

  const daysCount = getDays(m, y);
  const firstDay = getFirst(m, y);

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(<div key={`empty-${i}`} />);
  for (let d = 1; d <= daysCount; d++) {
    const isToday =
      d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
    calendarDays.push(
      <div
        key={d}
        style={{
          textAlign: "center",
          padding: "10px 0",
          borderRadius: "50%",
          backgroundColor: isToday ? "#ff5f5f" : "transparent",
          color: isToday ? "#fff" : "#333",
          fontWeight: isToday ? 700 : 400,
          userSelect: "none",
          boxShadow: isToday ? "0 0 8px rgba(255,95,95,0.7)" : "none",
        }}
        aria-current={isToday ? "date" : undefined}
      >
        {d}
      </div>
    );
  }

  // ------------------------------
  // Navigation (user/admin)
  // ------------------------------
  const handleNavigate = (role) =>
    navigate(role === "user" ? "/userlogin-web" : "/login-app");

  // ------------------------------
  // Analog Clock calculations
  // ------------------------------
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secDeg = seconds * 6;
  const minDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = ((hours % 12) / 12) * 360 + minutes * 0.5;

  // ------------------------------
  // Modal (image preview) with focus management
  // ------------------------------
  const [selectedImage, setSelectedImage] = useState(null);
  const modalRef = useRef(null);
  useEffect(() => {
    if (selectedImage && modalRef.current) {
      modalRef.current.focus();
    }
  }, [selectedImage]);

  // Preload carousel images for snappier UX
  useEffect(() => {
    offers.forEach((o) => {
      const img = new Image();
      img.src = o.img;
    });
  }, [offers]);

  // Pause-on-hover for the carousel
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // ------------------------------
  // Unique Feature: Quick EMI Calculator
  // ------------------------------
  const [principal, setPrincipal] = useState(100000);
  const [annualRate, setAnnualRate] = useState(12);
  const [monthsInput, setMonthsInput] = useState(12);

  const { emi, totalInterest, totalPayment } = useMemo(() => {
    const P = Number(principal) || 0;
    const r = (Number(annualRate) || 0) / 12 / 100;
    const n = Math.max(1, Math.floor(Number(monthsInput) || 1));
    if (r === 0) {
      const e = P / n;
      return {
        emi: e,
        totalInterest: 0,
        totalPayment: e * n,
      };
    }
    const pow = Math.pow(1 + r, n);
    const e = (P * r * pow) / (pow - 1);
    return {
      emi: e,
      totalInterest: e * n - P,
      totalPayment: e * n,
    };
  }, [principal, annualRate, monthsInput]);

  const fmt = (num) =>
    Number(num || 0).toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

  // ------------------------------
  // Google Play badge config (links to the package user provided)
  // ------------------------------
  const playStoreUrl =
    "https://play.google.com/store/apps/details?id=com.gagansk.cusapp&hl=en_IN";

  // ------------------------------
  // New: Chit Plans (from your notes)
  // ------------------------------
  const chitPlans = useMemo(
    () => [
      { name: "Chit Smart", chitValue: 100000, daily: 100, installment: 1000, members: 100 },
      { name: "Chit Smart", chitValue: 500000, daily: 1000, installment: 10000, members: 50 },
      { name: "Chit Smart", chitValue: 200000, daily: 200, installment: 2000, members: 100 },
      { name: "Chit Smart", chitValue: 300000, daily: 300, installment: 3000, members: 100 },
      { name: "Chit Smart", chitValue: 500000, daily: 500, installment: 5000, members: 100 },
      { name: "Chit Smart", chitValue: 100000, daily: 200, installment: 2000, members: 50 },
      { name: "Chit Smart", chitValue: 200000, daily: 400, installment: 4000, members: 50 },
      { name: "Chit Smart", chitValue: 300000, daily: 600, installment: 6000, members: 50 },
    ],
    []
  );
const [monkeyText, setMonkeyText] = React.useState("Hi 👋");

React.useEffect(() => {
  // When user scrolls
  const handleScroll = () => {
    setMonkeyText("Weee! 🐒 Scrolling!");
    setTimeout(() => setMonkeyText("Hi 👋"), 2000);
  };

  // When user clicks
  const handleClick = () => {
    setMonkeyText("Ouch! 🐵 You clicked!");
    setTimeout(() => setMonkeyText("Hi 👋"), 2000);
  };

  // When user moves mouse
  const handleMouseMove = () => {
    setMonkeyText("Hehe 🐒 I'm watching!");
    setTimeout(() => setMonkeyText("Hi 👋"), 2000);
  };

  window.addEventListener("scroll", handleScroll);
  window.addEventListener("click", handleClick);
  window.addEventListener("mousemove", handleMouseMove);

  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("click", handleClick);
    window.removeEventListener("mousemove", handleMouseMove);
  };
}, []);

  const rupee = (n) => `₹ ${Number(n).toLocaleString()}`;
  const lakhText = (n) => {
    if (n >= 100000) {
      const lakhs = n / 100000;
      return `${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1)} Lakh`;
    }
    return rupee(n);
  };

  return (
    <div style={styles.page}>
      {/* Animations & small global styles */}
      <style>{`
        @keyframes bgAni { 0% {background-position:0% 50%;} 50% {background-position:100% 50%;} 100% {background-position:0% 50%;} }
        @keyframes slideOffers { 0% {transform: translateX(0);} 100% {transform: translateX(-50%);} }
        button:hover { filter: brightness(0.92); }
        @media (max-width: 520px) { .hide-sm { display: none; } }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.phoneContainer}>
          <a href="tel:+919483900777" style={styles.headerLink} aria-label="Call MyChits">
            📞 +91-9483900777
          </a>
          <a href="tel:+917669865563" style={styles.headerLink} aria-label="Call MyChits (Alt)">
            📞 +91-7669865563
          </a>
          <a
            href="mailto:info.mychit@gmail.com"
            style={styles.headerLink}
            aria-label="Email MyChits"
          >
            📧 info.mychit@gmail.com
          </a>
        </div>
        <div style={styles.socialIcons}>
      <a
        href="https://www.facebook.com/Mychitfund/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
          alt="Facebook"
          style={styles.icon}
        />
      </a>
      <a
        href="https://www.instagram.com/my_chits/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
          alt="Instagram"
          style={styles.icon}
        />
      </a>
    </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src="https://mychits.co.in/assets/images/logo.png"
            alt="MyChits Logo"
            style={styles.logo}
            onClick={() => window.location.reload()}
          />
          {/* NEW: Login button in header */}
          <button
            type="button"
            style={styles.loginHeaderBtn}
            onClick={() => navigate("/userlogin-web")}
            aria-label="Go to user login"
          >
            Login
          </button>
        </div>
      </header>

      {/* Hero */}
      <section style={styles.heroSection}>
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQJ8fYA1ljPLBn6-oBcnQk3aHReC7Kyeff6A&s"
          alt="Stylish finance hero"
          style={styles.heroImage}
          loading="lazy"
        />
        <div style={styles.heroText}>
          <h1 style={styles.heroTitle}>MyChits: Your Finance, Your Power!</h1>
          <p style={styles.heroSub}>Secure • Stylish • Smart</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              style={styles.heroBtn}
              onClick={() => document.querySelector('#plans')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Offers
            </button>
            {/* Play Store badge/button */}
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get our app on Google Play"
              style={styles.playBtn}
            >
              Get it on Google Play
            </a>
          </div>
        </div>
      </section>

      {/* Offers Carousel (pause on hover) */}
      <section style={styles.offersSection}>
        <div
          ref={trackRef}
          style={{
            ...styles.offersTrack,
            animationPlayState: isPaused ? "paused" : "running",
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          aria-label="Promotional offers carousel"
          role="list"
        >
          {[...offers, ...offers].map((o, i) => (
            <img
              key={i}
              src={o.img}
              alt={o.alt}
              style={styles.offerImg}
              onClick={() => setSelectedImage(o.img)}
              loading="lazy"
              title="Click to view"
              role="listitem"
            />
          ))}
        </div>
      </section>

      {/* Modal for image preview */}
      {selectedImage && (
        <div
          ref={modalRef}
          style={styles.modal}
          tabIndex={-1}
          onClick={() => setSelectedImage(null)}
          onKeyDown={(e) => e.key === "Escape" && setSelectedImage(null)}
          aria-label="Close image preview"
          role="dialog"
          aria-modal="true"
        >
          <img src={selectedImage} alt="Offer detail" style={styles.modalImg} loading="lazy" />
        </div>
      )}

      {/* Info Cards: Calendar + Quote/Clock + EMI Calculator */}
      <section style={styles.infoSection}>
        {/* Calendar */}
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>Mychit Calendar</h3>
          <div style={styles.calControls}>
            <button aria-label="Previous Month" onClick={() => setDate(new Date(y, m - 1, 1))}>
              ◀
            </button>
            <span aria-live="polite" aria-atomic="true">
              {months[m]} {y}
            </span>
            <button aria-label="Next Month" onClick={() => setDate(new Date(y, m + 1, 1))}>
              ▶
            </button>
          </div>
          <div style={styles.dayLabels}>
            {daysOfWeek.map((d) => (
              <div key={d} aria-label={d}>
                {d}
              </div>
            ))}
          </div>
          <div style={styles.calGrid}>{calendarDays}</div>
        </div>

        {/* Quote + Clock */}
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>Thought of the Moment</h3>
          <p style={styles.quote} aria-live="polite" aria-atomic="true">
            {thoughts[thoughtIndex]}
          </p>

          <h3 style={styles.infoTitle}>Current Time</h3>
          <p style={styles.clock} aria-live="polite" aria-atomic="true">
            {digitalTime}
          </p>

          <div style={styles.analogClock} aria-label="Analog clock">
  {/* Hour, Minute, Second hands */}
  <div style={{ ...styles.hand, ...styles.hourHand, transform: `rotate(${hourDeg}deg)` }} />
  <div style={{ ...styles.hand, ...styles.minuteHand, transform: `rotate(${minDeg}deg)` }} />
  <div style={{ ...styles.hand, ...styles.secondHand, transform: `rotate(${secDeg}deg)` }} />

  {/* 🔥 Logo inside the center */}
  <img
    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKi_gQkofA1oCEB6odC8w0gj5OAK34eNGABw&s"
    alt="MyChits Logo"
    style={styles.clockLogo}
  />

  {/* Red center dot (on top of logo for effect) */}
  <div style={styles.clockCenter} />
</div>

        </div>

        {/* EMI Calculator */}
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>MyChits EMI Calculator</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={styles.label}>
              Principal (₹)
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                style={styles.input}
                min={0}
              />
            </label>
            <label style={styles.label}>
              Annual Rate (%)
              <input
                type="number"
                step="0.01"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
                style={styles.input}
                min={0}
              />
            </label>
            <label style={styles.label}>
              Tenure (months)
              <input
                type="number"
                value={monthsInput}
                onChange={(e) => setMonthsInput(e.target.value)}
                style={styles.input}
                min={1}
              />
            </label>
            <div />
          </div>
          <div style={styles.emiResults}>
            <div>
              <div style={styles.resultLabel}>Monthly EMI</div>
              <div style={styles.resultValue}>₹ {fmt(emi)}</div>
            </div>
            <div>
              <div style={styles.resultLabel}>Total Interest</div>
              <div style={styles.resultValue}>₹ {fmt(totalInterest)}</div>
            </div>
            <div>
              <div style={styles.resultLabel}>Total Payment</div>
              <div style={styles.resultValue}>₹ {fmt(totalPayment)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Loan Schemes */}
      <section style={styles.schemeSection}>
        <h2 style={styles.schemeHeading}>Our Loan Schemes</h2>
        <div style={styles.schemeGrid}>
          {schemes.map((s, idx) => (
            <div key={idx} style={styles.schemeCard}>
              <h3>{s.title}</h3>
              <p>{s.details}</p>
              <button
                style={styles.schemeBtn}
                onClick={() => alert(`Learn more about ${s.title}`)}
                aria-label={`Learn more about ${s.title}`}
              >
                Learn How
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* NEW: Chit Plans Grid */}
      <section id="plans" style={styles.plansSection}>
        <h2 style={styles.schemeHeading}>Chit Plans</h2>
        <div style={styles.plansGrid}>
          {chitPlans.map((p, i) => (
            <article key={`${p.name}-${i}`} style={styles.planCard} aria-label={`${p.name} plan`}>
              <h3 style={{ marginBottom: 8 }}>{p.name}</h3>
              <ul style={styles.planList}>
                <li>
                  <strong>Chit Value:</strong> {lakhText(p.chitValue)}
                </li>
                <li>
                  <strong>Daily:</strong> {rupee(p.daily)} / day
                </li>
                <li>
                  <strong>Installment:</strong> {rupee(p.installment)} / INSTL
                </li>
                <li>
                  <strong>Members:</strong> {p.members}
                </li>
              </ul>
              <button style={styles.planBtn} onClick={() => alert(`${p.name} — ${lakhText(p.chitValue)}`)}>
                Enquire
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Login CTA */}
      <section style={styles.loginSection}>
        <div style={styles.loginCard}>
          <h2>Get Started with MyChits</h2>
          <p className="hide-sm" style={{ color: "#666", marginTop: 6 }}>
            Access your dashboard or manage as admin.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
            <button style={styles.userBtn} onClick={() => handleNavigate("user")} aria-label="User Login">
              User Login
            </button>
            <button style={styles.adminBtn} onClick={() => handleNavigate("admin")} aria-label="Admin Login">
              Admin Login
            </button>
          </div>
          {/* Secondary Play link */}
          <a
            href={playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-block", marginTop: 18, textDecoration: "none", fontWeight: 700, color: "#ff5f5f" }}
          >
            Also on Google Play →
          </a>
        </div>
      </section>
{/* 🐵 Monkey Mascot */}
{/* 🐵 Monkey Mascot */}
<div style={styles.monkey}>
  <div style={styles.monkeyFace}>🐵</div>
  <div style={styles.speechBubble}>{monkeyText}</div>
</div>


      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerTop}>
          <div style={styles.footerCol}>
            <img
              src="https://mychits.co.in/assets/images/logo.png"
              alt="MyChits Logo"
              style={{ height: 46, marginBottom: 10 }}
            />
            <p>© 2021 - {new Date().getFullYear()} MyChits. All Rights Reserved.</p>
            <p>Made with ❤ in India</p>
            <p>
              Email: <a href="mailto:info.mychit@gmail.com" style={styles.footerLink}>info.mychit@gmail.com</a>
            </p>
            <p>
              Phone: <a href="tel:+919483900777" style={styles.footerLink}>+91-9483900777</a> /
              <a href="tel:+917669865563" style={styles.footerLink}> +91-7669865563</a>
            </p>
          </div>

          <div style={styles.footerCol}>
            <h4 style={styles.footerHead}>Chit Plans</h4>
            <ul style={styles.footerList}>
              <li><a href="#plans" style={styles.footerLink}>Chit Smart</a></li>
              <li><a href="#plans" style={styles.footerLink}>Chit Pro</a></li>
              <li><a href="#plans" style={styles.footerLink}>Chit Saver</a></li>
              <li><a href="#plans" style={styles.footerLink}>Chit Wealth</a></li>
              <li><a href="#plans" style={styles.footerLink}>Chit Simple</a></li>
            </ul>
          </div>

          <div style={styles.footerCol}>
            <h4 style={styles.footerHead}>Company</h4>
            <ul style={styles.footerList}>
              <li><a href="#" style={styles.footerLink}>About Us</a></li>
              <li><a href="#" style={styles.footerLink}>Why Choose Us</a></li>
              <li><a href="#" style={styles.footerLink}>Privacy Policy</a></li>
              <li><a href="#" style={styles.footerLink}>Terms & Conditions</a></li>
              <li><a href="#" style={styles.footerLink}>Contact Us</a></li>
            </ul>
          </div>

          <div style={styles.footerCol}>
            <h4 style={styles.footerHead}>Learn</h4>
            <ul style={styles.footerList}>
              <li><a href="#" style={styles.footerLink}>How Chit Funds Work</a></li>
              <li><a href="#" style={styles.footerLink}>Our Catalogs</a></li>
              <li><a href="#" style={styles.footerLink}>FAQs</a></li>
              <li><a href="#" style={styles.footerLink}>Blogs</a></li>
              <li><a href="#plans" style={styles.footerLink}>Chit Enrollment Plans</a></li>
            </ul>
          </div>
        </div>

        <div style={styles.footerLegal}>
          <p>VIJAYA VINAYAK CHITFUNDS PRIVATE LIMITED | CIN: U65999KA2022PTC161858</p>
          <p>No 11/36-25, 2nd Main, Kathriguppe Main Road, Bangalore, Karnataka, India - 560070</p>
          <p>
            For any complaints regarding your chit plan, write to
            <a href="mailto:info.mychit@gmail.com" style={styles.footerLink}> info.mychit@gmail.com</a>.
          </p>
          <p>
            <a href="#" style={styles.footerLink}>T&amp;C</a> | <a href="#" style={styles.footerLink}>Privacy Policy</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Firstpage;

const styles = {
  page: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
    backgroundColor: "#fff",
    minHeight: "100vh",
  },
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: "10px 20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1000,
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#333",
    backdropFilter: "saturate(1.2) blur(4px)",
  },
  phoneContainer: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
    alignItems: "center",
  },
  headerLink: {
    textDecoration: "none",
    color: "#333",
    fontWeight: 600,
  },
  logo: { height: 50, cursor: "pointer" },
  heroSection: {
    marginTop: 70,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    color: "#fff",
    gap: 30,
    flexWrap: "wrap",
  },
  heroImage: {
    maxWidth: 300,
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  heroText: { maxWidth: 520 },
  heroTitle: { fontSize: "2.4rem", marginBottom: 10, fontWeight: 800 },
  heroSub: { fontSize: "1.1rem", marginBottom: 14 },
  heroBtn: {
    padding: "12px 20px",
    fontSize: "1rem",
    fontWeight: 700,
    backgroundColor: "#ff5f5f",
    color: "#fff",
    border: "none",
    borderRadius: 30,
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(255,95,95,0.4)",
  },
  playBtn: {
    padding: "12px 20px",
    fontSize: "1rem",
    fontWeight: 800,
    backgroundColor: "#0f9d58",
    color: "#fff",
    border: "none",
    borderRadius: 30,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(15,157,88,0.3)",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  offersSection: {
    overflow: "hidden",
    marginTop: 24,
    padding: "20px 0",
    background: "linear-gradient(270deg, #ffecd2, #fcb69f, #ffecd2)",
    backgroundSize: "600% 600%",
    animation: "bgAni 15s ease infinite",
  },
  offersTrack: {
    display: "flex",
    gap: 15,
    width: "max-content",
    animation: "slideOffers 20s linear infinite",
    padding: "0 10px",
  },
  offerImg: {
    width: 160,
    height: 110,
    objectFit: "cover",
    borderRadius: 10,
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
    userSelect: "none",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1500,
    cursor: "pointer",
    outline: "none",
  },
  modalImg: {
    maxWidth: "90vw",
    maxHeight: "90vh",
    borderRadius: 12,
    boxShadow: "0 8px 20px rgba(255,255,255,0.3)",
  },
  infoSection: {
    display: "flex",
    gap: 40,
    padding: "40px 20px",
    flexWrap: "wrap",
    justifyContent: "center",
    backgroundColor: "#f7f7f7",
  },
  infoCard: {
    flex: "1 1 320px",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },
  infoTitle: { fontWeight: 800, fontSize: "1.25rem", marginBottom: 14, color: "#333" },
  calControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    fontWeight: 700,
    fontSize: "1.05rem",
  },
  dayLabels: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    textAlign: "center",
    fontWeight: 700,
    color: "#777",
    marginBottom: 10,
  },
  calGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 6,
    fontSize: "1rem",
    color: "#444",
  },
  quote: { fontSize: "1.05rem", fontStyle: "italic", marginBottom: 18, color: "#555" },
  clock: {
    fontSize: "2rem",
    fontWeight: 800,
    marginBottom: 14,
    fontFamily: "'Courier New', Courier, monospace",
    color: "#444",
  },
  analogClock: {
    width: 160,
    height: 160,
    border: "7px solid #ff5f5f",
    borderRadius: "50%",
    position: "relative",
    margin: "0 auto",
    backgroundColor: "#fff",
    boxShadow: "0 0 15px rgba(255,95,95,0.35)",
  },
  hand: {
    position: "absolute",
    bottom: "50%",
    left: "50%",
    transformOrigin: "bottom center",
    transition: "transform 0.5s cubic-bezier(0.4, 2.3, 0.3, 1)",
  },
  hourHand: { width: 6, height: 44, borderRadius: 3, backgroundColor: "#d43d3d", marginLeft: -3 },
  minuteHand: { width: 4, height: 68, borderRadius: 2, backgroundColor: "#ff5f5f", marginLeft: -2 },
  secondHand: { width: 2, height: 78, borderRadius: 1, backgroundColor: "blue", marginLeft: -1 },
  clockCenter: {
    position: "absolute",
    width: 14,
    height: 14,
    backgroundColor: "#ff5f5f",
    borderRadius: "50%",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    boxShadow: "0 0 8px rgba(255,95,95,0.7)",
  },
  label: { display: "grid", gap: 6, fontWeight: 700, color: "#444" },
  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "0.95rem",
  },
  emiResults: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
  },
  resultLabel: { fontSize: 12, color: "#777" },
  resultValue: { fontSize: 18, fontWeight: 800 },
  schemeSection: { padding: "32px 20px", backgroundColor: "#fff" },
  schemeHeading: { fontSize: "2rem", fontWeight: 800, textAlign: "center", marginBottom: 22, color: "#333" },
  schemeGrid: { display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" },
  schemeCard: {
    flex: "1 1 280px",
    backgroundColor: "#fef6f6",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 4px 20px rgba(255,95,95,0.2)",
    textAlign: "center",
    color: "#d43d3d",
  },
  schemeBtn: {
    marginTop: 16,
    padding: "10px 22px",
    backgroundColor: "#ff5f5f",
    border: "none",
    borderRadius: 24,
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(255,95,95,0.35)",
  },
  // Plans
  plansSection: { padding: "32px 20px", backgroundColor: "#f7f7f7" },
  plansGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 18,
    maxWidth: 1100,
    margin: "0 auto",
  },
  planCard: {
    background: "#fff",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
    border: "1px solid #ffe1e1",
  },
  planList: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 },
  planBtn: {
    marginTop: 12,
    padding: "10px 18px",
    backgroundColor: "#ff5f5f",
    border: "none",
    borderRadius: 12,
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    width: "100%",
  },
  loginSection: { backgroundColor: "#fbe9e9", padding: "34px 20px", textAlign: "center" },
  loginCard: {
    maxWidth: 460,
    margin: "0 auto",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 26,
    boxShadow: "0 6px 25px rgba(255,95,95,0.3)",
  },
  userBtn: {
    padding: "12px 24px",
    backgroundColor: "#ff5f5f",
    border: "none",
    borderRadius: 30,
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: "1.05rem",
    boxShadow: "0 4px 12px rgba(255,95,95,0.5)",
  },
  adminBtn: {
    padding: "12px 24px",
    backgroundColor: "#d43d3d",
    border: "none",
    borderRadius: 30,
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: "1.05rem",
    boxShadow: "0 4px 12px rgba(212,61,61,0.5)",
  },
  footer: { backgroundColor: "#DBB7AB", color: "#fff", marginTop: 40 },
  footerTop: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    padding: "24px 20px 10px",
    alignItems: "start",
  },
  footerCol: { lineHeight: 1.7 },
  footerList: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 },
  footerHead: { margin: "0 0 8px 0", fontSize: "1.05rem", fontWeight: 800 },
  footerLegal: { textAlign: "center", padding: "12px 20px 24px", borderTop: "1px solid rgba(255,255,255,0.25)" },
  footerLink: { color: "#fff", fontWeight: 700, textDecoration: "underline" },
  loginHeaderBtn: {
    padding: "8px 16px",
    backgroundColor: "#ff5f5f",
    border: "none",
    borderRadius: 20,
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "0.95rem",
    boxShadow: "0 3px 8px rgba(255,95,95,0.4)",
  },
  socialIcons: {
  display: "flex",
  gap: 10,
  alignItems: "center",
},
icon: {
  width: 30,
  height: 30,
  cursor: "pointer",
  transition: "transform 0.2s ease",
},
clockLogo: {
  position: "absolute",
  top: "50%",
  left: "50%",
  width: 100,      // adjust size as needed
  height: 100,
  borderRadius: "50%",
  transform: "translate(-50%, -50%)",
  objectFit: "contain",
  pointerEvents: "none", // so it doesn’t block hand animations
  zIndex: 2, 
  opacity:0.5// below red dot but above hands
},
monkey: {
  position: "fixed",
  bottom: 80,
  right: 20,
  display: "flex",
  alignItems: "center",
  gap: 10,
  zIndex: 2000,
  animation: "float 2s infinite ease-in-out",
},

monkeyFace: {
  fontSize: "3rem",
  background: "#fff7e6",
  borderRadius: "50%",
  padding: "10px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
},

speechBubble: {
  backgroundColor: "#ff914d",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: "12px 12px 0 12px",
  fontWeight: 700,
  fontSize: "1rem",
  boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
},

"@keyframes float": {
  "0%": { transform: "translateY(0px)" },
  "50%": { transform: "translateY(-6px)" },
  "100%": { transform: "translateY(0px)" },
},


};
