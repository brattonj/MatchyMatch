/**
 * @file useDarkMode.js
 * @description Custom hook for managing dark mode state with localStorage persistence.
 * Respects system preference on first load, then persists user choice.
 * 
 * @returns {Object} Dark mode state and toggle function
 * @returns {boolean} .dark - Whether dark mode is enabled
 * @returns {Function} .toggle - Function to toggle dark mode
 */

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'puzzlr-dark-mode'

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(STORAGE_KEY, String(dark))
  }, [dark])

  const toggle = () => setDark((d) => !d)

  return { dark, toggle }
}
