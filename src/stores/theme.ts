/**
 * Theme Store implementing Modern Web Guidance `dark-mode-toggle`:
 * - Uses `<meta name="color-scheme">` ("light dark" | "light" | "dark")
 * - Checks divergence at storage time: if the user selects the scheme that already matches
 *   the OS preference, removes the stored override from localStorage instead of pinning it.
 * - Synchronizes across browser tabs via the `storage` event.
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type ColorSchemeOverride = 'light' | 'dark' | null

const STORAGE_KEY = 'color-scheme'

export const useThemeStore = defineStore('theme', () => {
  const storedOverride = ref<ColorSchemeOverride>(null)
  const systemPrefersDark = ref<boolean>(false)

  function getMetaElement(): HTMLMetaElement | null {
    if (typeof document === 'undefined') return null
    return document.querySelector('meta[name="color-scheme"]')
  }

  function applyMetaContent(override: ColorSchemeOverride) {
    const meta = getMetaElement()
    if (meta) {
      meta.content = override ?? 'light dark'
    }
  }

  const resolvedScheme = computed<'light' | 'dark'>(() => {
    if (storedOverride.value === 'light' || storedOverride.value === 'dark') {
      return storedOverride.value
    }
    return systemPrefersDark.value ? 'dark' : 'light'
  })

  function initTheme() {
    if (typeof window === 'undefined') return

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    systemPrefersDark.value = mql.matches
    mql.addEventListener('change', (e) => {
      systemPrefersDark.value = e.matches
    })

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'light' || saved === 'dark') {
        storedOverride.value = saved
      } else {
        storedOverride.value = null
      }
    } catch {
      storedOverride.value = null
    }

    applyMetaContent(storedOverride.value)

    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        const val = e.newValue
        storedOverride.value = val === 'light' || val === 'dark' ? val : null
        applyMetaContent(storedOverride.value)
      }
    })
  }

  function toggleTheme() {
    const currentRendered = resolvedScheme.value
    const targetScheme: 'light' | 'dark' =
      currentRendered === 'dark' ? 'light' : 'dark'
    const currentSystem: 'light' | 'dark' = systemPrefersDark.value
      ? 'dark'
      : 'light'

    if (targetScheme === currentSystem) {
      // Undoing adjustment: remove stored value rather than pinning
      storedOverride.value = null
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // Ignore storage error
      }
    } else {
      storedOverride.value = targetScheme
      try {
        localStorage.setItem(STORAGE_KEY, targetScheme)
      } catch {
        // Ignore storage error
      }
    }

    applyMetaContent(storedOverride.value)
  }

  return {
    storedOverride,
    systemPrefersDark,
    resolvedScheme,
    initTheme,
    toggleTheme,
  }
})
