import { useLiveQuery } from 'dexie-react-hooks'
import { db, DEFAULT_SETTINGS } from '../db'
import type { AppSettings } from '../types'

export function useSettings() {
  const settings = useLiveQuery(() => db.settings.get('default'), []) ?? DEFAULT_SETTINGS

  const updateSettings = async (updates: Partial<AppSettings>) => {
    const current = (await db.settings.get('default')) ?? DEFAULT_SETTINGS
    await db.settings.put({ ...current, ...updates })
  }

  return { settings, updateSettings }
}
