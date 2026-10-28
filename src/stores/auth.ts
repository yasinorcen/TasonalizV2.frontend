import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  apiFetch,
  clearTokens,
  getAccessToken,
  setTokens,
} from '@/services/api'
import type { AuthTokens, UserProfile } from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  const isAuthenticated = computed(() => Boolean(user.value))

  async function initAuth() {
    if (initialized.value) return
    const token = getAccessToken()
    if (!token) {
      initialized.value = true
      return
    }
    try {
      loading.value = true
      user.value = await apiFetch<UserProfile>('/auth/me/')
    } catch {
      clearTokens()
      user.value = null
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function login(username: string, password: string) {
    loading.value = true
    try {
      const res = await apiFetch<{
        message: string
        user: UserProfile
        tokens: AuthTokens
      }>('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      setTokens(res.tokens.access, res.tokens.refresh)
      user.value = res.user
      return res
    } finally {
      loading.value = false
    }
  }

  async function register(payload: {
    username: string
    email: string
    first_name?: string
    last_name?: string
    password: string
    password_confirm: string
  }) {
    loading.value = true
    try {
      const res = await apiFetch<{
        message: string
        user: UserProfile
        tokens: AuthTokens
      }>('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setTokens(res.tokens.access, res.tokens.refresh)
      user.value = res.user
      return res
    } finally {
      loading.value = false
    }
  }

  function logout() {
    clearTokens()
    user.value = null
  }

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    initAuth,
    login,
    register,
    logout,
  }
})
