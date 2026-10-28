<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { apiFetch } from '@/services/api'
import type { CommoditiesPayload } from '@/types/api'
import { formatCurrency, formatDateTime, formatPercent } from '@/utils/formatters'

const payload = ref<CommoditiesPayload | null>(null)
const loading = ref(true)
const errorMsg = ref<string | null>(null)

async function fetchCommodities() {
  loading.value = true
  errorMsg.value = null
  try {
    payload.value = await apiFetch<CommoditiesPayload>('/commodities/')
  } catch (err) {
    errorMsg.value =
      err instanceof Error
        ? err.message
        : 'Altın, gümüş ve emtia verileri yüklenirken bir hata oluştu.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchCommodities)
</script>

<template>
  <div class="commodities-view">
    <header class="view-header">
      <div>
        <span class="badge badge-accent" style="margin-block-end: 0.5rem">
          Bölüm 3.5 — Altın Türleri, Gümüş, Bronz ve Döviz Referansı
        </span>
        <h1 class="hero-title">Altın, Gümüş, Bronz ve Değerli Metaller</h1>
        <p class="section-sub">
          Gram altın, çeyrek, yarım, tam, Cumhuriyet altını, gümüş ve bronz/bakır
          varlıklarına ilişkin birim, para birimi, hesaplama yöntemi, kaynak ve son
          güncellenme bilgileri aşağıda şeffaf biçimde sunulmaktadır.
        </p>
      </div>
      <button type="button" class="btn btn-sm" @click="fetchCommodities">
        Verileri Yenile ↻
      </button>
    </header>

    <div v-if="loading" class="state-box">
      Altın türleri, gümüş ve emtia verileri ücretsiz sağlayıcıdan alınıyor...
    </div>

    <div v-else-if="errorMsg" class="state-box state-box-error">
      {{ errorMsg }}
    </div>

    <template v-else-if="payload">
      <!-- FX Reference Banner -->
      <div class="fx-banner card" style="margin-block-end: 1.5rem">
        <div>
          <strong>Döviz Dönüşüm Referansı ({{ payload.fx_reference.pair }}):</strong>
          <span class="fx-rate">
            {{
              payload.fx_reference.rate !== null
                ? `${payload.fx_reference.rate.toLocaleString('tr-TR', {
                    minimumFractionDigits: 4,
                  })} ₺`
                : 'Veri Yok'
            }}
          </span>
          <span
            v-if="payload.fx_reference.change_percent !== null"
            class="badge"
            :class="
              payload.fx_reference.change_percent >= 0
                ? 'badge-positive'
                : 'badge-negative'
            "
            style="margin-inline-start: 0.5rem"
          >
            {{ formatPercent(payload.fx_reference.change_percent) }}
          </span>
        </div>
        <div class="fx-meta">
          Kaynak:
          <a
            :href="payload.fx_reference.source_url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ payload.fx_reference.source_name }} ↗
          </a>
        </div>
      </div>

      <!-- Asset Cards -->
      <div class="assets-grid">
        <article
          v-for="asset in payload.assets"
          :key="asset.code"
          class="asset-card card"
          :class="{ 'asset-unavailable': !asset.data_available }"
        >
          <div class="asset-top">
            <div>
              <span class="badge badge-neutral" style="margin-block-end: 0.35rem">
                {{ asset.category }}
              </span>
              <h2 class="asset-name">{{ asset.name }}</h2>
            </div>

            <span
              v-if="asset.data_available && asset.change_percent !== null"
              class="badge"
              :class="
                asset.change_percent >= 0 ? 'badge-positive' : 'badge-negative'
              "
            >
              {{ formatPercent(asset.change_percent) }}
            </span>
            <span v-else-if="!asset.data_available" class="badge badge-warning">
              Standart Spot Veri Yok
            </span>
          </div>

          <div class="asset-price-box">
            <template v-if="asset.data_available">
              <span class="price-label">Spot / Referans Değer</span>
              <strong class="price-main">
                {{
                  formatCurrency(
                    asset.spot_price,
                    asset.currency,
                    asset.code === 'BAKIR_REF' ? 4 : 2
                  )
                }}
              </strong>
            </template>
            <template v-else>
              <span class="price-label">Veri Durumu (Bölüm 3.5 İlkesi)</span>
              <strong class="price-unavailable">
                Ücretsiz Borsa Kaynaklarında Tekil Fiyat Yok
              </strong>
            </template>
          </div>

          <dl class="asset-details">
            <div class="detail-row">
              <dt>Birim &amp; Para Birimi:</dt>
              <dd>{{ asset.unit }} ({{ asset.currency }})</dd>
            </div>
            <div class="detail-row">
              <dt>Alış / Satış Ayrımı:</dt>
              <dd>{{ asset.spread_note }}</dd>
            </div>
            <div class="detail-row">
              <dt>Hesaplama / Açıklama:</dt>
              <dd>{{ asset.calculation_note }}</dd>
            </div>
            <div class="detail-row">
              <dt>Veri Kaynağı:</dt>
              <dd>
                <a
                  :href="asset.source_url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ asset.source_name }} ↗
                </a>
              </dd>
            </div>
            <div class="detail-row">
              <dt>Son Güncelleme:</dt>
              <dd>{{ formatDateTime(asset.last_updated) }} (Gecikmeli)</dd>
            </div>
          </dl>
        </article>
      </div>

      <div class="state-box state-box-warning" style="margin-block-start: 1.5rem">
        <strong>Bilgilendirme Notu:</strong> {{ payload.disclaimer }}
      </div>
    </template>
  </div>
</template>

<style scoped>
.view-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-block-end: 1.5rem;
}

.fx-banner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.fx-rate {
  font-size: 1.15rem;
  font-weight: 800;
  margin-inline-start: 0.5rem;
  color: var(--accent-primary);
}

.fx-meta {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.15rem;
}

.asset-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
}

.asset-unavailable {
  border-style: dashed;
}

.asset-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.asset-name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
}

.asset-price-box {
  padding: 0.85rem 1rem;
  border-radius: var(--radius-sm);
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-color);
}

.price-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  margin-block-end: 0.2rem;
}

.price-main {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--accent-primary);
}

.price-unavailable {
  font-size: 1rem;
  font-weight: 700;
  color: var(--warning-text);
}

.asset-details {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-size: 0.84rem;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.detail-row dt {
  font-weight: 700;
  color: var(--text-secondary);
}

.detail-row dd {
  margin: 0;
  color: var(--text-muted);
}
</style>
