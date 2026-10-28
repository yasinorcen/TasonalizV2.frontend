<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()
const mobileMenuOpen = ref(false)

function handleLogout() {
  authStore.logout()
  mobileMenuOpen.value = false
  router.push('/')
}
</script>

<template>
  <header class="navbar">
    <div class="container navbar-inner">
      <div class="navbar-brand-group">
        <RouterLink to="/" class="brand-link" @click="mobileMenuOpen = false">
          <span class="brand-mark" aria-hidden="true">T</span>
          <div>
            <span class="brand-name">Tasonaliz</span>
            <span class="brand-tag">BIST &amp; KAP Simülasyonu</span>
          </div>
        </RouterLink>
      </div>

      <button
        type="button"
        class="btn btn-sm mobile-menu-btn"
        :aria-expanded="mobileMenuOpen"
        aria-label="Menüyü aç/kapat"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        {{ mobileMenuOpen ? 'Kapat ✕' : 'Menü ☰' }}
      </button>

      <nav
        class="navbar-links"
        :class="{ 'is-open': mobileMenuOpen }"
        aria-label="Ana gezinme"
      >
        <RouterLink to="/" class="nav-link" @click="mobileMenuOpen = false">
          Ana Sayfa
        </RouterLink>
        <RouterLink
          to="/sirketler"
          class="nav-link"
          @click="mobileMenuOpen = false"
        >
          Şirketler (BIST)
        </RouterLink>
        <RouterLink
          to="/altin-ve-emtia"
          class="nav-link"
          @click="mobileMenuOpen = false"
        >
          Altın &amp; Değerli Metaller
        </RouterLink>
        <RouterLink
          to="/hakkinda"
          class="nav-link"
          @click="mobileMenuOpen = false"
        >
          Veri Kaynakları &amp; Hakkında
        </RouterLink>

        <div class="navbar-actions">
          <button
            type="button"
            class="btn btn-sm theme-toggle-btn"
            :title="
              themeStore.resolvedScheme === 'dark'
                ? 'Açık temaya geç'
                : 'Koyu temaya geç'
            "
            @click="themeStore.toggleTheme()"
          >
            <span aria-hidden="true">
              {{ themeStore.resolvedScheme === 'dark' ? '☀️' : '🌙' }}
            </span>
            <span>
              {{
                themeStore.resolvedScheme === 'dark' ? 'Açık Tema' : 'Koyu Tema'
              }}
            </span>
            <span v-if="!themeStore.storedOverride" class="theme-sub-badge">
              (Sistem)
            </span>
          </button>

          <template v-if="authStore.isAuthenticated && authStore.user">
            <span class="user-pill" title="Giriş yapılan kullanıcı">
              👤 {{ authStore.user.username }}
            </span>
            <button
              type="button"
              class="btn btn-sm"
              @click="handleLogout"
            >
              Çıkış
            </button>
          </template>
          <template v-else>
            <RouterLink
              to="/hesap"
              class="btn btn-sm btn-primary"
              @click="mobileMenuOpen = false"
            >
              Giriş / Kayıt
            </RouterLink>
          </template>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  inset-block-start: 0;
  z-index: 30;
  background: var(--bg-surface);
  border-block-end: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-block-size: 4.25rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--text-primary);
  text-decoration: none;
}

.brand-link:hover {
  text-decoration: none;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 10px;
  background: var(--accent-primary);
  color: #ffffff;
  font-weight: 800;
  font-size: 1.15rem;
}

.brand-name {
  display: block;
  font-weight: 800;
  font-size: 1.15rem;
  line-height: 1.1;
}

.brand-tag {
  display: block;
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 500;
}

.mobile-menu-btn {
  display: none;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 1.15rem;
  flex-wrap: wrap;
}

.nav-link {
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.92rem;
  padding: 0.35rem 0.5rem;
  border-radius: var(--radius-sm);
}

.nav-link.router-link-active {
  color: var(--accent-primary);
  background: var(--accent-soft);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-inline-start: 0.5rem;
}

.theme-sub-badge {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.user-pill {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-color);
}

@media (max-width: 900px) {
  .mobile-menu-btn {
    display: inline-flex;
  }

  .navbar-links {
    display: none;
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    padding-block: 0.75rem 1rem;
    border-block-start: 1px solid var(--border-color);
  }

  .navbar-links.is-open {
    display: flex;
  }

  .navbar-actions {
    margin-inline-start: 0;
    padding-block-start: 0.5rem;
    flex-wrap: wrap;
  }
}
</style>
