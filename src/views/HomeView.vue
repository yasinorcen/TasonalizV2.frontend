<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { apiFetch } from '@/services/api'
import type { HomeOverviewPayload } from '@/types/api'
import {
  formatCompactNumber,
  formatCurrency,
  formatDateTime,
  formatPercent,
} from '@/utils/formatters'

const router = useRouter()
const overview = ref<HomeOverviewPayload | null>(null)
const loading = ref(true)
const errorMsg = ref<string | null>(null)
const quickSearch = ref('')

async function loadOverview() {
  loading.value = true
  errorMsg.value = null
  try {
    overview.value = await apiFetch<HomeOverviewPayload>('/overview/')
  } catch (err) {
    errorMsg.value =
      err instanceof Error
        ? err.message
        : 'Piyasa özeti yüklenirken bir hata oluştu.'
  } finally {
    loading.value = false
  }
}

function submitQuickSearch() {
  const q = quickSearch.value.trim()
  if (q) {
    router.push({ name: 'companies', query: { q } })
  } else {
    router.push({ name: 'companies' })
  }
}

onMounted(loadOverview)
</script>

<template>
  <div class="home-view">
    <!-- Hero Banner -->
    <section class="hero-card card">
      <div class="hero-content">
        <span class="badge badge-accent" style="margin-block-end: 0.75rem">
          Borsa İstanbul · KAP Finansal Tablolar · Değerli Metaller
        </span>
        <h1 class="hero-title">
          Borsa İstanbul Şirketlerini ve KAP Finansal Tablolarını Tek Arayüzde İnceleyin
        </h1>
        <p class="hero-desc">
          Tasonaliz; BIST şirketlerinin hisse fiyatlarını, Bilanço, Gelir Tablosu ve Nakit
          Akış Tablosu verilerini, sadeleştirilmiş temel analizlerini, şirket haberlerini
          ve altın/gümüş/bronz değerlerini sunan öğrenci amaçlı bir bilgilendirme ve
          simülasyon platformudur.
        </p>

        <form class="quick-search-bar" @submit.prevent="submitQuickSearch">
          <label for="home-company-search" class="sr-only">
            Şirket adı veya hisse kodu ara
          </label>
          <input
            id="home-company-search"
            v-model="quickSearch"
            type="search"
            class="input"
            placeholder="Hisse kodu veya şirket adı ara (ör. THYAO, ASELS, GARAN, EREGL)..."
          />
          <button type="submit" class="btn btn-primary">Şirket Ara</button>
        </form>
      </div>

      <div v-if="overview" class="hero-stats">
        <div class="stat-pill">
          <span class="stat-label">Listelenen BIST Şirketi</span>
          <strong class="stat-val">{{ overview.bist_stats.total_companies }}</strong>
          <span class="stat-sub">Resmî KAP Dizininden</span>
        </div>
        <div class="stat-pill">
          <span class="stat-label">BIST 30 Endeks Şirketi</span>
          <strong class="stat-val">{{ overview.bist_stats.bist30_count }}</strong>
          <span class="stat-sub">Öne Çıkan Ana Şirketler</span>
        </div>
        <div
          v-if="overview.market_summary.bist100"
          class="stat-pill"
        >
          <span class="stat-label">BIST 100 Endeksi (Gecikmeli)</span>
          <strong class="stat-val">
            {{
              overview.market_summary.bist100.last_price !== null
                ? overview.market_summary.bist100.last_price.toLocaleString('tr-TR')
                : 'Veri Yok'
            }}
          </strong>
          <span
            v-if="overview.market_summary.bist100.change_percent !== null"
            class="badge"
            :class="
              (overview.market_summary.bist100.change_percent || 0) >= 0
                ? 'badge-positive'
                : 'badge-negative'
            "
          >
            {{ formatPercent(overview.market_summary.bist100.change_percent) }}
          </span>
        </div>
      </div>
    </section>

    <div v-if="loading" class="state-box" style="margin-block-start: 1.5rem">
      Piyasa özeti, öne çıkan şirketler ve değerli metal fiyatları yükleniyor...
    </div>

    <div
      v-else-if="errorMsg"
      class="state-box state-box-error"
      style="margin-block-start: 1.5rem"
    >
      <p style="margin: 0 0 0.75rem 0">{{ errorMsg }}</p>
      <button type="button" class="btn btn-sm" @click="loadOverview">
        Tekrar Dene
      </button>
    </div>

    <template v-else-if="overview">
      <!-- Featured BIST Companies -->
      <section class="home-section">
        <div class="section-header-row">
          <div>
            <h2 class="section-title">Öne Çıkan Borsa İstanbul Şirketleri</h2>
            <p class="section-sub">
              Hisse fiyatları gerçek zamanlı değildir; ücretsiz veri sağlayıcısının sunduğu
              gecikmeli/gün sonu güncelliğiyle gösterilir.
            </p>
          </div>
          <RouterLink to="/sirketler" class="btn btn-sm">
            Tüm BIST Şirketlerini Gör ({{ overview.bist_stats.total_companies }}) →
          </RouterLink>
        </div>

        <div class="card-Grid">
          <RouterLink
            v-for="stock in overview.market_summary.featured_quotes"
            :key="stock.code"
            :to="`/sirketler/${stock.code}`"
            class="stock-card card"
          >
            <div class="stock-card-top">
              <div>
                <span class="stock-code">{{ stock.code }}</span>
                <span class="stock-name">{{ stock.name || stock.code }}</span>
              </div>
              <span
                v-if="stock.change_percent !== null"
                class="badge"
                :class="
                  stock.change_percent >= 0 ? 'badge-positive' : 'badge-negative'
                "
              >
                {{ formatPercent(stock.change_percent) }}
              </span>
              <span v-else class="badge badge-neutral">Gecikmeli</span>
            </div>

            <div class="stock-price-row">
              <strong class="stock-price">
                {{
                  stock.data_available
                    ? formatCurrency(stock.last_price, stock.currency)
                    : 'Veri Yok'
                }}
              </strong>
              <span class="stock-meta">
                Piyasa Değeri: {{ formatCompactNumber(stock.market_cap, 'TL') }}
              </span>
            </div>

            <div class="stock-card-footer">
              <span>KAP Tabloları &amp; Analiz →</span>
              <span class="delay-tag">15 dk gecikmeli</span>
            </div>
          </RouterLink>
        </div>

        <div class="source-meta-bar" style="margin-block-start: 0.85rem">
          <span>
            <strong>Kaynak:</strong> {{ overview.market_summary.source_name }} (Gecikmeli
            Veri)
          </span>
          <span>
            <strong>Son Güncellenme:</strong>
            {{ formatDateTime(overview.market_summary.last_updated) }}
          </span>
        </div>
      </section>

      <!-- Precious Metals & Commodities Preview -->
      <section class="home-section">
        <div class="section-header-row">
          <div>
            <h2 class="section-title">Altın, Gümüş ve Değerli Metal Özeti</h2>
            <p class="section-sub">
              Küresel ons fiyatları ve USD/TRY paritesi ({{
                overview.commodities_preview.fx_reference.rate
                  ? `${overview.commodities_preview.fx_reference.rate} ₺`
                  : '—'
              }}) üzerinden hesaplanan referans değerler.
            </p>
          </div>
          <RouterLink to="/altin-ve-emtia" class="btn btn-sm">
            Tüm Altın Türleri, Gümüş &amp; Bronz Detayı →
          </RouterLink>
        </div>

        <div class="card-Grid">
          <div
            v-for="asset in overview.commodities_preview.assets"
            :key="asset.code"
            class="commodity-mini card"
          >
            <div class="commodity-mini-top">
              <strong>{{ asset.name }}</strong>
              <span
                v-if="asset.change_percent !== null"
                class="badge"
                :class="
                  asset.change_percent >= 0 ? 'badge-positive' : 'badge-negative'
                "
              >
                {{ formatPercent(asset.change_percent) }}
              </span>
            </div>
            <div class="commodity-mini-val">
              {{
                asset.data_available
                  ? formatCurrency(asset.spot_price, asset.currency)
                  : 'Veri Yok'
              }}
            </div>
            <div class="commodity-mini-unit">Birim: {{ asset.unit }}</div>
          </div>
        </div>
      </section>

      <!-- Recent Community Comments -->
      <section class="home-section">
        <div class="section-header-row">
          <div>
            <h2 class="section-title">Son Kullanıcı Yorumları</h2>
            <p class="section-sub">
              Kullanıcıların şirket ve KAP finansal tablo sayfalarına bıraktığı son
              değerlendirmeler.
            </p>
          </div>
        </div>

        <div v-if="overview.recent_comments.length === 0" class="state-box">
          Henüz topluluk yorumu bulunmuyor. Herhangi bir şirket veya finansal tablo
          sayfasına giderek ilk yorumu ekleyebilirsiniz.
        </div>

        <div v-else class="card-Grid">
          <article
            v-for="c in overview.recent_comments"
            :key="c.id"
            class="card recent-comment-card"
          >
            <div class="rc-top">
              <RouterLink :to="`/sirketler/${c.company_code}`" class="badge badge-accent">
                {{ c.company_code }}
                <template v-if="c.statement_type"> · {{ c.statement_type }}</template>
                <template v-if="c.period"> ({{ c.period }})</template>
              </RouterLink>
              <span class="rc-date">{{ formatDateTime(c.created_at) }}</span>
            </div>
            <p class="rc-body">{{ c.content }}</p>
            <div class="rc-author">
              👤 {{ c.author_username }}
              <span v-if="c.is_edited" class="rc-edited">(düzenlendi)</span>
            </div>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.hero-card {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: 1.5rem;
  align-items: center;
  padding: 1.75rem;
  background: linear-gradient(
    135deg,
    var(--bg-surface) 0%,
    var(--bg-surface-alt) 100%
  );
}

.hero-desc {
  color: var(--text-secondary);
  margin: 0 0 1.25rem 0;
  font-size: 0.98rem;
}

.quick-search-bar {
  display: flex;
  gap: 0.65rem;
}

.hero-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-pill {
  padding: 0.9rem 1.1rem;
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stat-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 600;
}

.stat-val {
  font-size: 1.35rem;
  font-weight: 800;
}

.stat-sub {
  font-size: 0.76rem;
  color: var(--text-muted);
}

.home-section {
  margin-block-start: 2.25rem;
}

.section-header-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  margin-block-end: 1rem;
}

.section-sub {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text-muted);
}

.stock-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.9rem;
  color: var(--text-primary);
  text-decoration: none;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease;
}

.stock-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent-primary);
  text-decoration: none;
}

.stock-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.stock-code {
  display: block;
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--accent-primary);
}

.stock-name {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stock-price {
  display: block;
  font-size: 1.35rem;
  font-weight: 800;
}

.stock-meta {
  display: block;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.stock-card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--accent-primary);
  font-weight: 600;
  padding-block-start: 0.6rem;
  border-block-start: 1px solid var(--border-color);
}

.delay-tag {
  color: var(--text-muted);
  font-weight: 500;
}

.commodity-mini-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-block-end: 0.5rem;
}

.commodity-mini-val {
  font-size: 1.3rem;
  font-weight: 800;
  margin-block-end: 0.25rem;
}

.commodity-mini-unit {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.recent-comment-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.65rem;
}

.rc-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.rc-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.rc-body {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rc-author {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
}

.rc-edited {
  font-style: italic;
}

@media (max-width: 860px) {
  .hero-card {
    grid-template-columns: 1fr;
  }

  .quick-search-bar {
    flex-direction: column;
  }
}
</style>
