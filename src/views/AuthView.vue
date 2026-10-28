<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const mode = ref<'LOGIN' | 'REGISTER'>('LOGIN')
const errorMsg = ref<string | null>(null)

// Login fields
const loginIdentifier = ref('')
const loginPassword = ref('')

// Register fields
const regUsername = ref('')
const regEmail = ref('')
const regFirstName = ref('')
const regLastName = ref('')
const regPassword = ref('')
const regPasswordConfirm = ref('')

async function handleLogin() {
  errorMsg.value = null
  try {
    await authStore.login(loginIdentifier.value, loginPassword.value)
    router.push('/')
  } catch (err) {
    errorMsg.value =
      err instanceof Error ? err.message : 'Giriş yapılırken bir hata oluştu.'
  }
}

async function handleRegister() {
  errorMsg.value = null
  try {
    await authStore.register({
      username: regUsername.value,
      email: regEmail.value,
      first_name: regFirstName.value,
      last_name: regLastName.value,
      password: regPassword.value,
      password_confirm: regPasswordConfirm.value,
    })
    router.push('/')
  } catch (err) {
    errorMsg.value =
      err instanceof Error ? err.message : 'Kayıt sırasında bir hata oluştu.'
  }
}
</script>

<template>
  <div class="auth-view">
    <div class="auth-card card">
      <div class="auth-tabs" role="tablist">
        <button
          type="button"
          class="auth-tab"
          :class="{ active: mode === 'LOGIN' }"
          @click=";(mode = 'LOGIN'), (errorMsg = null)"
        >
          Giriş Yap
        </button>
        <button
          type="button"
          class="auth-tab"
          :class="{ active: mode === 'REGISTER' }"
          @click=";(mode = 'REGISTER'), (errorMsg = null)"
        >
          Hesap Oluştur (Kayıt Ol)
        </button>
      </div>

      <div v-if="errorMsg" class="state-box state-box-error" style="margin-block-end: 1rem">
        {{ errorMsg }}
      </div>

      <!-- LOGIN FORM -->
      <form v-if="mode === 'LOGIN'" class="auth-form" @submit.prevent="handleLogin">
        <h1 class="section-title">Tasonaliz Hesabınıza Giriş Yapın</h1>
        <p class="auth-desc">
          Giriş yaparak şirket ve KAP finansal tablo sayfalarına kendi yorum ve analiz
          notlarınızı ekleyebilirsiniz.
        </p>

        <div class="form-group">
          <label for="login-username">Kullanıcı Adı veya E-posta</label>
          <input
            id="login-username"
            v-model="loginIdentifier"
            type="text"
            autocomplete="username"
            class="input"
            required
          />
        </div>

        <div class="form-group">
          <label for="login-password">Parola</label>
          <input
            id="login-password"
            v-model="loginPassword"
            type="password"
            autocomplete="current-password"
            class="input"
            required
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          style="width: 100%"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Giriş Yapılıyor...' : 'Giriş Yap' }}
        </button>
      </form>

      <!-- REGISTER FORM -->
      <form v-else class="auth-form" @submit.prevent="handleRegister">
        <h1 class="section-title">Yeni Kullanıcı Hesabı Oluşturun</h1>
        <p class="auth-desc">
          Parolanız Django'nun yerleşik şifreleme altyapısıyla güvenli biçimde saklanır;
          düz metin olarak kaydedilmez.
        </p>

        <div class="form-group">
          <label for="reg-username">Kullanıcı Adı *</label>
          <input
            id="reg-username"
            v-model="regUsername"
            type="text"
            autocomplete="username"
            minlength="3"
            maxlength="30"
            class="input"
            placeholder="Örn: finans_ogrencisi"
            required
          />
        </div>

        <div class="form-group">
          <label for="reg-email">E-posta Adresi *</label>
          <input
            id="reg-email"
            v-model="regEmail"
            type="email"
            autocomplete="email"
            class="input"
            placeholder="ornek@universite.edu.tr"
            required
          />
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label for="reg-fname">Ad (İsteğe Bağlı)</label>
            <input
              id="reg-fname"
              v-model="regFirstName"
              type="text"
              autocomplete="given-name"
              class="input"
            />
          </div>
          <div class="form-group">
            <label for="reg-lname">Soyad (İsteğe Bağlı)</label>
            <input
              id="reg-lname"
              v-model="regLastName"
              type="text"
              autocomplete="family-name"
              class="input"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="reg-pass">Parola (En az 8 karakter) *</label>
          <input
            id="reg-pass"
            v-model="regPassword"
            type="password"
            autocomplete="new-password"
            minlength="8"
            class="input"
            required
          />
        </div>

        <div class="form-group">
          <label for="reg-pass-confirm">Parola Tekrar *</label>
          <input
            id="reg-pass-confirm"
            v-model="regPasswordConfirm"
            type="password"
            autocomplete="new-password"
            minlength="8"
            class="input"
            required
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          style="width: 100%"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-view {
  display: flex;
  justify-content: center;
  padding-block: 1.5rem;
}

.auth-card {
  width: min(520px, 100%);
  padding: 1.75rem;
}

.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-block-end: 1.5rem;
}

.auth-tab {
  padding: 0.65rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background: var(--bg-surface-alt);
  color: var(--text-secondary);
  font-weight: 700;
  cursor: pointer;
}

.auth-tab.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #ffffff;
}

.auth-desc {
  margin: 0 0 1.25rem 0;
  font-size: 0.88rem;
  color: var(--text-muted);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

@media (max-width: 520px) {
  .form-row-2 {
    grid-template-columns: 1fr;
  }
}
</style>
