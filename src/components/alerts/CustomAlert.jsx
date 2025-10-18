import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";
import { memo, useEffect, useState } from "react";

const CustomAlert = memo(({ isVisible, type = "info", message ,noReload =false}) => {
  const [isClosing, setIsClosing] = useState(false);

  const alertConfig = {
    success: {
      bg: "bg-green-50",
      text: "text-green-800",
      border: "border-green-300",
      icon: <FaCheckCircle className="h-5 w-5 text-green-400" />,
    },
    error: {
      bg: "bg-red-50",
      text: "text-red-800",
      border: "border-red-300",
      icon: <FaTimesCircle className="h-5 w-5 text-red-400" />,
    },
    warning: {
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      border: "border-yellow-300",
      icon: <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />,
    },
    info: {
      bg: "bg-blue-50",
      text: "text-blue-800",
      border: "border-blue-300",
      icon: <FaInfoCircle className="h-5 w-5 text-blue-400" />,
    },
  };

  useEffect(() => {
    if (isVisible) {
      setIsClosing(false);

      const timer = setTimeout(() => {
        setIsClosing(true);
        if(!noReload)
        window.location.reload();
        // setTimeout(onClose, 300);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible && !isClosing) return null;

  return (
    <div className="fixed top-4 left-1/2 z-[100] -translate-x-1/2 transform">
      <div
        className={`${alertConfig[type].bg} ${alertConfig[type].border} ${
          alertConfig[type].text
        } flex w-full max-w-xs items-center rounded-lg p-4 shadow-lg transition-all duration-300 md:max-w-md ${
          isClosing
            ? "translate-y-[-100%] opacity-0"
            : "translate-y-0 opacity-100"
        }`}
        role="alert"
        aria-live="assertive"
      >
        {alertConfig[type].icon}
        <span className="ml-3 flex-1 break-words text-sm font-medium">
          {message}
        </span>
        <button
          onClick={() => {
            setIsClosing(true);
          }}
          className={`ml-auto -mx-1.5 -my-1.5 rounded-full p-1.5 hover:bg-gray-200 hover:bg-opacity-90`}
          aria-label="Close"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
});

export default CustomAlert;
