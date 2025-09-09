import React, { useEffect, useRef } from 'react';

const Watch = () => {
  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  const secondRef = useRef(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const seconds = now.getSeconds();
      const minutes = now.getMinutes();
      const hours = now.getHours();

      const secondDeg = seconds * 6;
      const minuteDeg = minutes * 6 + seconds * 0.1;
      const hourDeg = ((hours % 12) / 12) * 360 + (minutes / 60) * 30;

      secondRef.current.style.transform = `rotate(${secondDeg}deg)`;
      minuteRef.current.style.transform = `rotate(${minuteDeg}deg)`;
      hourRef.current.style.transform = `rotate(${hourDeg}deg)`;
    };

    const interval = setInterval(updateClock, 1000);
    updateClock();

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.clock}>
        {/* Numbers */}
        <div style={{ ...styles.number, ...styles.number12 }}>12</div>
        <div style={{ ...styles.number, ...styles.number3 }}>3</div>
        <div style={{ ...styles.number, ...styles.number6 }}>6</div>
        <div style={{ ...styles.number, ...styles.number9 }}>9</div>

        {/* Center Logo */}
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQJ8fYA1ljPLBn6-oBcnQk3aHReC7Kyeff6A"
          alt="Logo"
          style={styles.logo}
        />

        {/* Clock Hands */}
        <div ref={hourRef} style={{ ...styles.hand, ...styles.hour }} />
        <div ref={minuteRef} style={{ ...styles.hand, ...styles.minute }} />
        <div ref={secondRef} style={{ ...styles.hand, ...styles.second }} />
      </div>
    </div>
  );
};

// ✅ Enlarged Internal CSS Styles
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
  },
  clock: {
    position: 'relative',
    width: '600px',
    height: '600px',
    border: '14px solid black',
    borderRadius: '50%',
    backgroundColor: 'white',
  },
  number: {
    position: 'absolute',
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  number12: {
    top: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  number3: {
    right: '5px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  number6: {
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  number9: {
    left: '5px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  logo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '480px',
    height: '470px',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    objectFit: 'cover',
    opacity: 0.5,
    pointerEvents: 'none',
  },
  hand: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transformOrigin: 'bottom center',
    transform: 'rotate(0deg)',
    transition: 'transform 0.5s ease-in-out',
  },
  hour: {
    width: '10px',
    height: '150px',
    backgroundColor: 'black',
    zIndex: 3,
    marginTop: '-150px',
  },
  minute: {
    width: '6px',
    height: '210px',
    backgroundColor: '#333',
    zIndex: 2,
    marginTop: '-210px',
  },
  second: {
    width: '2px',
    height: '250px',
    backgroundColor: 'red',
    zIndex: 1,
    marginTop: '-250px',
  },
};

export default Watch;
