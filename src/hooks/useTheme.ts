import { useEffect } from 'react'
import { useSettings } from './useSettings'

export function useTheme() {
  const { settings, updateSettings } = useSettings()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
  }

  return { theme: settings.theme, toggleTheme }
}
