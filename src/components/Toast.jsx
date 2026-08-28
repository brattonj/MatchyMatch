/**
 * @file Toast.jsx
 * @description Toast notification component that appears at the top of the screen.
 * Automatically dismisses after 1.8 seconds with fade-out animation.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.message - Message text to display
 * @param {Function} props.onDone - Callback when toast has finished dismissing
 * @returns {React.ReactElement} Toast notification with auto-dismiss
 * 
 * @state {boolean} visible - Whether the toast is currently visible
 */

import { useEffect, useState } from "react";
import { clsx } from "clsx";

export default function Toast({ message, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 280);
    }, 1800);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        "fixed top-20 left-1/2 -translate-x-1/2 z-50",
        "text-sm font-medium px-5 py-2.5 rounded-full",
        "pointer-events-none",
        "transition-all duration-280"
      )}
      style={{
        background: "rgba(28,28,30,0.88)",
        color: "#ffffff",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(255,255,255,0.08)",
        letterSpacing: "-0.01em",
        opacity: visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${visible ? "0" : "-6px"})`,
        transition: "opacity 0.28s ease, transform 0.28s ease",
      }}
    >
      {message}
    </div>
  );
}
