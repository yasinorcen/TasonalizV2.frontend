<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/services/api'
import type { CompanyItem } from '@/types/api'

const route = useRoute()
const router = useRouter()

const companies = ref<CompanyItem[]>([])
const sectors = ref<string[]>([])
const totalBistCount = ref(0)
const sourceName = ref('')
const sourceUrl = ref('https://www.kap.org.tr/tr/bist-sirketler')

const searchQuery = ref((route.query.q as string) || '')
const selectedSector = ref('')
const bist30Only = ref(false)
const selectedLetter = ref('ALL')

const loading = ref(true)
const errorMsg = ref<string | null>(null)

const alphabet = [
  'ALL',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'Y', 'Z',
]

async function fetchCompanies() {
  loading.value = true
  errorMsg.value = null
  try {
    const params = new URLSearchParams()
    if (searchQuery.value.trim()) {
      params.set('q', searchQuery.value.trim())
    }
    if (selectedSector.value) {
      params.set('sector', selectedSector.value)
    }
    if (bist30Only.value) {
      params.set('bist30', 'true')
    }

    const res = await apiFetch<{
      count: number
      total_bist_count: number
      sectors: string[]
      source_name: string
      source_url: string
      results: CompanyItem[]
    }>(`/companies/?${params.toString()}`)

    companies.value = res.results
    sectors.value = res.sectors
    totalBistCount.value = res.total_bist_count
    sourceName.value = res.source_name
    sourceUrl.value = res.source_url
  } catch (err) {
    errorMsg.value =
      err instanceof Error
        ? err.message
        : 'Şirket listesi yüklenirken bir hata oluştu.'
  } finally {
    loading.value = false
  }
}

const filteredByLetter = computed(() => {
  if (selectedLetter.value === 'ALL') return companies.value
  return companies.value.filter((c) =>
    c.code.toUpperCase().startsWith(selectedLetter.value)
  )
})

function resetFilters() {
  searchQuery.value = ''
  selectedSector.value = ''
  bist30Only.value = false
  selectedLetter.value = 'ALL'
  router.replace({ query: {} })
  fetchCompanies()
}

onMounted(fetchCompanies)

watch([selectedSector, bist30Only], () => {
  fetchCompanies()
})
</script>

<template>
  <div class="companies-view">
    <header class="view-header">
      <div>
        <h1 class="hero-title" style="margin-block-end: 0.35rem">
          Borsa İstanbul (BIST) Şirketler Dizini
        </h1>
        <p class="section-sub">
          Resmî KAP dizininden senkronize edilen toplam
          <strong>{{ totalBistCount }}</strong> Borsa İstanbul şirketini hisse kodu,
          şirket unvanı veya sektör bazında arayabilir; finansal tablolarına ve
          analizlerine ulaşabilirsiniz.
        </p>
      </div>
    </header>

    <!-- Search & Filter Controls -->
    <section class="filter-panel card" aria-label="Şirket arama ve filtreleme">
      <form class="filter-grid" @submit.prevent="fetchCompanies">
        <div class="filter-field">
          <label for="company-search-input" class="filter-label">
            Hisse Kodu veya Şirket Unvanı
          </label>
          <input
            id="company-search-input"
            v-model="searchQuery"
            type="search"
            class="input"
            placeholder="Örn: THYAO, ASELS, GARAN, Türk Hava Yolları..."
          />
        </div>

        <div class="filter-field">
          <label for="sector-select" class="filter-label">Sektör Filtresi</label>
          <select id="sector-select" v-model="selectedSector" class="select">
            <option value="">Tüm Sektörler</option>
            <option v-for="sec in sectors" :key="sec" :value="sec">
              {{ sec }}
            </option>
          </select>
        </div>

        <div class="filter-actions">
          <label class="checkbox-label">
            <input v-model="bist30Only" type="checkbox" />
            <span>Sadece BIST 30</span>
          </label>
          <button type="submit" class="btn btn-primary">Ara / Filtrele</button>
          <button type="button" class="btn" @click="resetFilters">Sıfırla</button>
        </div>
      </form>

      <!-- Alphabet Quick Filter -->
      <div class="alphabet-bar" role="group" aria-label="Baş harfe göre filtrele">
        <button
          v-for="letter in alphabet"
          :key="letter"
          type="button"
          class="letter-btn"
          :class="{ active: selectedLetter === letter }"
          @click="selectedLetter = letter"
        >
          {{ letter === 'ALL' ? 'Tümü' : letter }}
        </button>
      </div>
    </section>

    <!-- States -->
    <div v-if="loading" class="state-box" style="margin-block-start: 1.25rem">
      Borsa İstanbul şirket listesi yükleniyor...
    </div>

    <div
      v-else-if="errorMsg"
      class="state-box state-box-error"
      style="margin-block-start: 1.25rem"
    >
      {{ errorMsg }}
    </div>

    <div
      v-else-if="filteredByLetter.length === 0"
      class="state-box"
      style="margin-block-start: 1.25rem"
    >
      Arama kriterlerinize uygun BIST şirketi bulunamadı. Filtreleri sıfırlayarak tekrar
      deneyebilirsiniz.
    </div>

    <!-- Responsive Data Table (Modern Web Guidance `responsive-table`) -->
    <div
      v-else
      tabindex="0"
      role="region"
      aria-labelledby="bist-companies-caption"
      class="table-wrapper"
      style="margin-block-start: 1.25rem"
    >
      <table class="data-table stack-mobile">
        <caption id="bist-companies-caption">
          Gösterilen Şirket Sayısı: {{ filteredByLetter.length }} / Toplam BIST:
          {{ totalBistCount }}
        </caption>
        <thead>
          <tr>
            <th scope="col">Hisse Kodu</th>
            <th scope="col">Şirket Unvanı</th>
            <th scope="col">Sektör</th>
            <th scope="col">Endeks</th>
            <th scope="col">Yorumlar</th>
            <th scope="col">İşlemler &amp; KAP</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="comp in filteredByLetter" :key="comp.code">
            <th scope="row">
              <RouterLink
                :to="`/sirketler/${comp.code}`"
                class="code-link"
              >
                {{ comp.code }}
              </RouterLink>
            </th>
            <td data-label="Şirket Unvanı">
              <RouterLink
                :to="`/sirketler/${comp.code}`"
                style="color: var(--text-primary); font-weight: 500"
              >
                {{ comp.name }}
              </RouterLink>
            </td>
            <td data-label="Sektör">
              <span class="badge badge-neutral">{{ comp.sector }}</span>
            </td>
            <td data-label="Endeks">
              <span v-if="comp.is_bist30" class="badge badge-accent">BIST 30</span>
              <span v-else class="text-muted-sm">BIST TÜM</span>
            </td>
            <td data-label="Yorumlar">
              <span class="badge badge-neutral">{{ comp.comment_count }} yorum</span>
            </td>
            <td data-label="İşlemler">
              <div class="row-actions">
                <RouterLink
                  :to="`/sirketler/${comp.code}`"
                  class="btn btn-sm btn-primary"
                >
                  Detay &amp; Tablolar
                </RouterLink>
                <a
                  v-if="comp.kap_url"
                  :href="comp.kap_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-sm"
                  title="Resmî KAP Şirket Sayfası"
                >
                  KAP ↗
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="source-meta-bar" style="margin-block-start: 0.85rem">
      <span>
        <strong>Kaynak:</strong>
        <a :href="sourceUrl" target="_blank" rel="noopener noreferrer">
          {{ sourceName || 'Kamuyu Aydınlatma Platformu (KAP)' }} ↗
        </a>
      </span>
      <span>
        Şirket dizini kamuya açık resmî KAP BIST şirketler listesinden alınmaktadır.
      </span>
    </div>
  </div>
</template>

<style scoped>
.view-header {
  margin-block-end: 1.25rem;
}

.filter-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr auto;
  gap: 1rem;
  align-items: end;
}

.filter-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-block-end: 0.35rem;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  padding-inline-end: 0.35rem;
}

.alphabet-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  padding-block-start: 0.75rem;
  border-block-start: 1px solid var(--border-color);
}

.letter-btn {
  padding: 0.25rem 0.55rem;
  font-size: 0.78rem;
  font-weight: 700;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface-alt);
  color: var(--text-secondary);
  cursor: pointer;
}

.letter-btn.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #ffffff;
}

.code-link {
  font-weight: 800;
  font-size: 0.98rem;
}

.text-muted-sm {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.row-actions {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
