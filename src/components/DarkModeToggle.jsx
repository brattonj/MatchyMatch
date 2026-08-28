/**
 * @file DarkModeToggle.jsx
 * @description Button component to toggle between dark and light modes.
 * Displays sun icon in dark mode and moon icon in light mode.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.dark - Current dark mode state
 * @param {Function} props.onToggle - Callback when toggle button is clicked
 * @returns {React.ReactElement} Toggle button with theme icon
 */

import { Sun, Moon } from 'lucide-react'

export default function DarkModeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        borderRadius: 'var(--radius-full)',
        border: 'none',
        background: 'var(--fill-tertiary)',
        color: 'var(--label-secondary)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 0.15s ease, color 0.15s ease, transform 0.12s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--fill-secondary)'
        e.currentTarget.style.color = 'var(--label-primary)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--fill-tertiary)'
        e.currentTarget.style.color = 'var(--label-secondary)'
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.92)'
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {dark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
    </button>
  )
}
